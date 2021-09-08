import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from './core/config';
import { config } from './app.config';
import { ClusterService } from './cluster.service';

async function bootstrap() {
  const configService = new ConfigService(config);
  const app = await NestFactory.create(AppModule);

  // starts listening for shutdown hooks
  app.enableShutdownHooks();
  app.enableCors();
  app.setGlobalPrefix(configService.getPrefix());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configService.getPort());
  Logger.log(
    `${configService.getConfig().name} (${
      configService.getConfig().id
    }) running on port ${configService.getPort()}`,
  );
}

ClusterService.clusterize(Logger, bootstrap);
