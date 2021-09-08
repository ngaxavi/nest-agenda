import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { CreateJobDto, UpdateJobDto } from './dto';
import { AgendaService } from '../core/agenda';
import { Model, Types } from 'mongoose';
import { Status } from './jobs.interface';
import { InjectModel } from '@nestjs/mongoose';
import { JobDocument } from './jobs.schema';
import dayjs from 'dayjs';
import { Job } from 'agenda';
import humanizeDuration = require('humanize-duration');

const maxRetries = 5;

@Injectable()
export class JobsService implements OnModuleInit, OnApplicationShutdown {
  constructor(
    @InjectModel('Job') private model: Model<JobDocument>,
    private readonly agenda: AgendaService,
    private readonly logger: Logger,
  ) {}

  async onModuleInit(): Promise<any> {
    this.agenda.on('start', (job) => {
      // this.logger.log(`Job ${JSON.stringify(job)} is running`);
    });

    this.agenda.on('fail', this.onJobFailure);

    const jobs = await this.findAll();

    for (const job of jobs) {
      this.agenda.define(
        job.name,
        { lockLimit: 1, concurrency: 1 },
        this.runJob,
      );
    }
  }

  async onApplicationShutdown(signal?: string): Promise<any> {
    if (signal === 'SIGTERM' || signal === 'SIGINT') {
      await this.agenda.stop();
      process.exit(0);
    }
  }

  async createJob(dto: CreateJobDto) {
    this.logger.debug(`Create a new job with value ${JSON.stringify(dto)}`);
    const job = this.agenda.create(dto.name, {
      ...dto.data,
      status: dto.status,
    });
    job.repeatEvery(
      humanizeDuration(dto.scheduleTime, {
        conjunction: ' and ',
        serialComma: false,
      }),
      { skipImmediate: true },
    );
    await job.save();
    if (dto.status === 'ACTIVATED') {
      this.agenda.define(dto.name, this.runJob);
    }
  }

  async findAll(): Promise<any> {
    this.logger.debug(`Find all existing jobs`);
    return this.model.find();
  }

  async findOne(id: string): Promise<JobDocument> {
    this.logger.debug(`Find One Job with id ${id}`);
    return this.model.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async updateOne(id: string, dto: UpdateJobDto) {
    this.logger.debug(
      `Update Job with id ${id}  and value ${JSON.stringify(dto)}`,
    );
    const { name, status, data, scheduleTime } = dto;
    const doc = await this.findOne(id);

    const collapseData = { ...(data || {}), ...(status && { status }) };

    const job = this.agenda.create(name ?? doc.name, {
      ...doc.data,
      ...collapseData,
    });
    job.repeatEvery((scheduleTime as any) ?? doc.scheduleTime, {
      skipImmediate: true,
    });
    job.unique({ _id: new Types.ObjectId(doc.id) });
    await job.save();
    return job;
  }

  async activateOrDeactivateOne(id: string, status: Status) {
    const job = await this.findOne(id);

    status === 'ACTIVATED'
      ? await this.agenda.enable({ name: job.name })
      : await this.agenda.disable({ name: job.name });
  }

  async deleteJob(id: string): Promise<JobDocument> {
    return this.model.findOneAndDelete({ _id: new Types.ObjectId(id) }).exec();
  }

  private runJob = (job) => {
    this.logger.log(`Job ${job.attrs.name} is running!`);
  };

  //====== https://github.com/agenda/agenda/pull/777 ==========
  private onJobFailure = async (error: any, job: Job<any>) => {
    const retryCount = job.attrs.failCount - 1;
    if (retryCount <= maxRetries) {
      job.attrs.nextRunAt = this.calcExponentialBackoff(retryCount);
      await job.save();
    }
  };

  private calcExponentialBackoff(retryCount: number) {
    const waitInSeconds =
      Math.pow(retryCount, 4) + 15 + Math.random() * 30 * (retryCount + 1);
    return dayjs().add(waitInSeconds, 'seconds').toDate();
  }
  // =============================================================================
}
