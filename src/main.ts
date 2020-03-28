import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const port = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
  logger.log(`App running on port ${port}`)
}
bootstrap();
