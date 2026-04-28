import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity, UserEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { FavoriteEntity, RatingEntity } from './entities';
import { ReportEntity } from './entities/report.entity';

/**
 * Módulo de comunidad para funcionalidades sociales e interacción de usuarios.
 *
 * Este módulo implementa todas las características de interacción social de MinFlix,
 * permitiendo a los usuarios marcar favoritos, calificar contenidos y reportar
 * problemas, además de proporcionar herramientas de moderación para el equipo
 * de soporte.
 *
 * @remarks
 * **Entidades gestionadas:**
 * - `FavoriteEntity`: Contenidos marcados como favoritos por perfiles
 * - `RatingEntity`: Calificaciones (1-5 estrellas) con reseñas opcionales
 * - `ReportEntity`: Reportes de contenido inapropiado con flujo de moderación
 * - `ProfileEntity`: Perfiles que interactúan con contenidos
 * - `UserEntity`: Usuarios moderadores que resuelven reportes
 * - `ContentEntity`: Contenidos multimedia sujetos a interacción social
 *
 * **Funcionalidades principales:**
 *
 * **1. Favoritos:**
 * - Agregar contenidos a favoritos por perfil
 * - Eliminar contenidos de favoritos
 * - Listar favoritos de un perfil
 * - Consultar estado de favorito para un contenido específico
 * - Validar restricciones de edad (infantil vs +16/+18)
 *
 * **2. Calificaciones:**
 * - Calificar contenidos con puntaje 1-5 estrellas
 * - Agregar reseña textual opcional a la calificación
 * - Actualizar calificación existente (upsert)
 * - Eliminar calificaciones propias
 * - Listar calificaciones de un perfil
 * - Regla: Solo se puede calificar si se ha visto >50% del contenido
 *
 * **3. Reportes y Moderación:**
 * - Crear reportes de contenido inapropiado por perfil
 * - Listar reportes propios por perfil
 * - Bandeja de moderación para roles soporte/admin
 * - Actualizar estado de reportes (ABIERTO → EN_REVISION → RESUELTO/DESCARTADO)
 * - Asignar moderador y registrar resolución
 * - Validación: No se pueden reabrir reportes cerrados
 *
 * **Endpoints expuestos:**
 * - `POST /api/v1/community/favorites` - Agregar favorito
 * - `DELETE /api/v1/community/favorites/:id` - Eliminar favorito
 * - `GET /api/v1/community/favorites` - Listar favoritos
 * - `GET /api/v1/community/favorites/status` - Consultar estado de favorito
 * - `POST /api/v1/community/ratings` - Calificar contenido
 * - `DELETE /api/v1/community/ratings/:id` - Eliminar calificación
 * - `GET /api/v1/community/ratings` - Listar calificaciones
 * - `GET /api/v1/community/ratings/status` - Consultar estado de calificación
 * - `POST /api/v1/community/reports` - Crear reporte
 * - `GET /api/v1/community/reports` - Listar reportes propios
 * - `GET /api/v1/community/moderation/reports` - Bandeja de moderación (soporte/admin)
 * - `PATCH /api/v1/community/moderation/reports/:id` - Moderar reporte (soporte/admin)
 *
 * @example
 * ```typescript
 * // Importar en otro módulo
 * @Module({
 *   imports: [CommunityModule],
 * })
 * export class OtroModule {}
 * ```
 *
 * @see {@link CommunityService} para la lógica de negocio de comunidad
 * @see {@link CommunityController} para los endpoints REST expuestos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteEntity,
      RatingEntity,
      ReportEntity,
      ProfileEntity,
      UserEntity,
      ContentEntity,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
