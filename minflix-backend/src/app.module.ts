/**
 * Módulo raíz de la aplicación MinFlix.
 *
 * Este módulo orquesta todos los módulos funcionales de la aplicación,
 * configurando la conexión a base de datos Oracle y exponiendo todos
 * los endpoints REST organizados por dominio de negocio.
 *
 * @remarks
 * **Módulos importados:**
 *
 * 1. **ConfigModule**: Gestión global de variables de entorno (`.env`)
 * 2. **TypeOrmModule**: Conexión asíncrona a Oracle Database
 * 3. **AuthModule**: Autenticación, registro y gestión de perfiles
 * 4. **CatalogModule**: Gestión de contenidos multimedia y categorías
 * 5. **PlaybackModule**: Tracking de reproducciones y continuidad
 * 6. **CommunityModule**: Favoritos, calificaciones y reportes de usuarios
 * 7. **FinanceModule**: Facturación, pagos y referidos
 * 8. **AnalyticsModule**: Analítica ejecutiva y reportes OLAP
 *
 * **Estructura de rutas generada:**
 * - `/api/v1/auth/*` - Autenticación y perfiles
 * - `/api/v1/catalog/*` - Catálogo de contenidos
 * - `/api/v1/playback/*` - Reproducciones
 * - `/api/v1/community/*` - Comunidad (favoritos, ratings, reportes)
 * - `/api/v1/finance/*` - Finanzas y pagos
 * - `/api/v1/analytics/*` - Analítica ejecutiva
 *
 * @example
 * ```typescript
 * // Este módulo es el punto de entrada de NestJS
 * const app = await NestFactory.create(AppModule);
 * await app.listen(3000);
 * ```
 *
 * @see {@link main.ts} para la configuración de arranque de la aplicación
 * @see {@link databaseConfig} para la configuración de conexión a Oracle
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { PlaybackModule } from './playback/playback.module';
import { CommunityModule } from './community/community.module';
import { FinanceModule } from './finance/finance.module';
import { AnalyticsModule } from './analytics/analytics.module';

/**
 * Módulo raíz que integra todos los módulos funcionales de MinFlix.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    AuthModule,
    CatalogModule,
    PlaybackModule,
    CommunityModule,
    FinanceModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
