import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateJobDto, UpdateJobDto } from './dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UsePipes(new ValidationPipe())
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findJobs() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOneJob(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Get(':id/disable')
  async cancelJob(@Param('id') id: string) {
    return this.jobsService.activateOrDeactivateOne(id, 'DEACTIVATED');
  }

  @Get(':id/enable')
  async enableJob(@Param('id') id: string) {
    return this.jobsService.activateOrDeactivateOne(id, 'ACTIVATED');
  }

  @Post()
  async createJob(@Body() jobDto: CreateJobDto) {
    return this.jobsService.createJob(jobDto);
  }

  @Put(':id')
  updateJob(@Param('id') id: string, @Body() jobDto: UpdateJobDto) {
    return this.jobsService.updateOne(id, jobDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return this.jobsService.deleteJob(id);
  }
}
