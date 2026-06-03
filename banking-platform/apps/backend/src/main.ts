import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // --- Seguridad HTTP headers (OWASP A05) ---
  app.use(helmet());

  // --- CORS controlado ---
  const allowedOrigins = config
    .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
    .split(',');
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // --- Validación global de DTOs (OWASP A03) ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true, // error si llegan propiedades extra
      transform: true, // convierte tipos automáticamente (string → number, etc.)
      disableErrorMessages: config.get('NODE_ENV') === 'production',
    }),
  );

  // --- Versionado URI: /api/v1/ ---
  app.enableVersioning({ type: VersioningType.URI });

  // --- Swagger (solo en entornos no productivos) ---
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Banking Requests API')
      .setDescription(
        'Plataforma de solicitudes digitales de productos bancarios',
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
}
bootstrap();
