import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from './core/config';
import { config } from './app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsModule } from './jobs/jobs.module';

const configProvider = {
  provide: 'CONFIG',
  useValue: new ConfigService(config).getConfig(),
};

@Module({
  imports: [
    ConfigModule.forRoot(config),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) =>
        configService.getMongo(),
      inject: [ConfigService],
    }),
    JobsModule,
  ],
  providers: [configProvider],
})
export class AppModule {}
