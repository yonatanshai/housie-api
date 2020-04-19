import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  const serverConfig = config.get('server');
  const port = process.env.PORT || serverConfig?.port || 5000;

  app.enableCors();
  await app.listen(port);
  logger.log(`App running on port ${port}`)
}
bootstrap();
