import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    app.use(helmet());
    app.use(cookieParser());
    app.enableCors({
      origin: [
        'http://localhost:5173',
        /\.vercel\.app$/,
        /\.onrender\.com$/,
        process.env.FRONTEND_URL || 'http://localhost:5173',
      ],
      credentials: true,
    });
    app.setGlobalPrefix('api');

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // Setup Swagger API Documentation
    const config = new DocumentBuilder()
      .setTitle('HANGA WORKS API')
      .setDescription('The Hanga Works platform API endpoints')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory);

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}/api`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Server failed to start. Check database credentials and backend configuration.', message);
    process.exit(1);
  }
}

bootstrap();
