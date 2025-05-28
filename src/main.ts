import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configDotenv } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './core/filter/all-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform.inceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

configDotenv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('NestJS TODO Playground API')
    .setDescription('The NestJS TODO Playground API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ValidationPipe'ı ekleyin
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3000);
  return app;
}
bootstrap();
