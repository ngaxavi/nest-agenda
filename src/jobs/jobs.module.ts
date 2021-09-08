import { Logger, Module } from '@nestjs/common';
import { AgendaModule } from '../core/agenda';
import { ConfigModule, ConfigService } from '../core/config';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobSchema } from './jobs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Job', schema: JobSchema }]),
    AgendaModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        db: {
          address: configService.getMongo().uri,
          collection: 'jobs',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService, Logger],
})
export class JobsModule {}
