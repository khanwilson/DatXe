import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validate } from './common/config/env.validation';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  // Validate environment variables before app starts
  validate(process.env);

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Apply middleware (order matters: RequestId first, then Logger)
  app.use(new RequestIdMiddleware().use.bind(new RequestIdMiddleware()));
  app.use(new LoggerMiddleware().use.bind(new LoggerMiddleware()));

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DatXe API')
    .setDescription('DatXe - Hệ thống đặt xe backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('API_PORT', 3000);
  await app.listen(port);
}

bootstrap();
