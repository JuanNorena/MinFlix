/** Decorador que define un módulo de NestJS */
import { Module } from '@nestjs/common';

/** Módulo de TypeORM para registrar entidades en el contexto de persistencia */
import { TypeOrmModule } from '@nestjs/typeorm';

/** Entidad de perfiles de usuario que reproducen contenido */
import { ProfileEntity } from '../auth/entities';

/** Entidad de contenidos multimedia reproducidos */
import { ContentEntity } from '../catalog/entities';

/** Controlador REST de reproducción y continuidad */
import { PlaybackController } from './playback.controller';

/** Servicio de lógica de negocio de reproducción y continuidad */
import { PlaybackService } from './playback.service';

/** Entidades del dominio de reproducción */
import { ContinueWatchingEntity, PlaybackEntity } from './entities';

/**
 * Módulo de reproducción y seguimiento de visualización de contenidos.
 *
 * Este módulo implementa el sistema de tracking de reproducciones de MinFlix,
 * permitiendo registrar eventos de inicio, progreso y finalización de
 * visualización de contenidos, así como gestionar la funcionalidad de
 * "Continuar viendo".
 *
 * @remarks
 * **Entidades gestionadas:**
 * - `PlaybackEntity`: Eventos de reproducción con progreso y estado
 * - `ContinueWatchingEntity`: Vista materializada para "Continuar viendo"
 * - `ProfileEntity`: Perfiles de usuario que reproducen contenido
 * - `ContentEntity`: Contenidos multimedia reproducidos
 *
 * **Funcionalidades principales:**
 * - Registrar inicio de reproducción de un contenido
 * - Actualizar progreso de reproducción en tiempo real
 * - Calcular porcentaje de avance automáticamente en Oracle
 * - Listar contenidos para continuar viendo por perfil
 * - Consultar historial de reproducciones por perfil
 * - Validar restricciones de edad según tipo de perfil (triggers Oracle)
 *
 * **Reglas de negocio aplicadas:**
 * - Los perfiles infantiles no pueden reproducir contenido +16 o +18
 * - El progreso no puede superar la duración total del contenido
 * - La cuenta debe estar ACTIVA para registrar reproducciones
 * - Cada evento actualiza la fila de "Continuar viendo" automáticamente
 *
 * **Endpoints expuestos:**
 * - `POST /api/v1/playback/start` - Iniciar reproducción
 * - `POST /api/v1/playback/progress` - Reportar progreso
 * - `GET /api/v1/playback/continue-watching` - Contenidos para continuar
 * - `GET /api/v1/playback/history` - Historial de reproducciones
 *
 * @example
 * ```typescript
 * // Importar en otro módulo
 * @Module({
 *   imports: [PlaybackModule],
 * })
 * export class OtroModule {}
 * ```
 *
 * @see {@link PlaybackService} para la lógica de tracking de reproducciones
 * @see {@link PlaybackController} para los endpoints REST expuestos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlaybackEntity,
      ContinueWatchingEntity,
      ProfileEntity,
      ContentEntity,
    ]),
  ],
  controllers: [PlaybackController],
  providers: [PlaybackService],
  exports: [PlaybackService],
})
export class PlaybackModule {}
