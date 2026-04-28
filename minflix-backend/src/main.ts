/**
 * Punto de entrada principal de la aplicación MinFlix Backend.
 *
 * Este archivo configura e inicia el servidor NestJS con todas las características
 * necesarias para una API REST empresarial segura y escalable.
 *
 * @packageDocumentation
 */

import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import express from 'express';
import { AppModule } from './app.module';

/**
 * Función de arranque de la aplicación MinFlix.
 *
 * Configura y levanta el servidor NestJS con las siguientes características:
 *
 * **Seguridad:**
 * - Helmet para protección de headers HTTP
 * - CORS configurado para el frontend
 * - Validación global de DTOs con class-validator
 *
 * **Performance:**
 * - Compresión gzip de respuestas HTTP
 * - Archivos estáticos para avatares con Express
 *
 * **Documentación:**
 * - Swagger UI en `/api/docs`
 * - Autenticación Bearer JWT documentada
 *
 * **Configuración:**
 * - Puerto desde variable de entorno `PORT` o 3000 por defecto
 * - Prefijo global de rutas: `/api/v1`
 * - Directorio de uploads creado automáticamente si no existe
 *
 * @remarks
 * Esta función es asíncrona y se auto-ejecuta al iniciar la aplicación.
 * Los errores en el arranque detendrán el proceso de Node.js.
 *
 * @example
 * ```bash
 * # Iniciar el servidor en desarrollo
 * npm run start:dev
 *
 * # Iniciar el servidor en producción
 * npm run start:prod
 *
 * # El servidor estará disponible en:
 * # http://localhost:3000
 * # Swagger UI: http://localhost:3000/api/docs
 * # Endpoints: http://localhost:3000/api/v1/*
 * ```
 *
 * @see {@link AppModule} para la configuración de módulos de la aplicación
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const uploadsDirectory = join(process.cwd(), 'uploads');
  const avatarsDirectory = join(uploadsDirectory, 'avatars');

  if (!existsSync(avatarsDirectory)) {
    mkdirSync(avatarsDirectory, { recursive: true });
  }

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    }),
  );
  app.use(compression());
  app.use('/uploads', express.static(uploadsDirectory));
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MinFlix API')
    .setDescription('API de MinFlix con NestJS, Oracle y Passport.js')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
