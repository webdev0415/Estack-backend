import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import config from '../config/index';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

/**
 * bootstrap app
 * sets nest express app instance
 * configures swagger
 */
async function bootstrap() {
  /** logger instance */
  const logger = new Logger('bootstrap');

  /** app instance */
  const app = await NestFactory.create(AppModule, { cors: config.corsEnabled });
  app.enableCors();

  /** security tweaks */
  app.use(helmet());

  /** limit rate */
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 100 requests per windowMs
    }),
  );

  /** validate all request dtos */
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  /** swagger config */
  const options = new DocumentBuilder()
  .setTitle(config.swagger.title)
  .setDescription(config.swagger.description)
  .setVersion(config.swagger.version)
  .addTag('health')
  .addTag('auth')
  .addTag('users')
  .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.use('/api-docs', (req, res) => res.send(document));

  /** listen to 0.0.0.0 will make server config easier */
  await app.listen(config.http.port, '0.0.0.0');

  logger.log(`app is listening on port ${config.http.port}`);
}

bootstrap();
