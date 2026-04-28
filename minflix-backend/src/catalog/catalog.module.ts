import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CategoryEntity, ContentEntity } from './entities';

/**
 * Módulo de catálogo para la gestión de contenidos multimedia.
 *
 * Este módulo implementa la funcionalidad completa de gestión del catálogo
 * de MinFlix, permitiendo administrar contenidos (películas, series, documentales,
 * música y podcasts) y sus categorías de clasificación.
 *
 * @remarks
 * **Entidades gestionadas:**
 * - `ContentEntity`: Contenidos multimedia del catálogo
 * - `CategoryEntity`: Categorías para clasificar contenidos
 * - `UserEntity`: Usuarios que publican contenidos (empleados)
 *
 * **Funcionalidades principales:**
 * - Listar y filtrar contenidos por categoría, tipo, clasificación de edad
 * - Crear, actualizar y consultar contenidos individuales
 * - Gestionar categorías del catálogo
 * - Control de acceso por rol (admin/contenido) para operaciones de escritura
 *
 * **Endpoints expuestos:**
 * - `GET /api/v1/catalog/categories` - Listar categorías
 * - `POST /api/v1/catalog/categories` - Crear categoría (admin/contenido)
 * - `GET /api/v1/catalog/contents` - Listar contenidos con filtros
 * - `GET /api/v1/catalog/contents/:id` - Detalle de contenido
 * - `POST /api/v1/catalog/contents` - Crear contenido (admin/contenido)
 * - `PATCH /api/v1/catalog/contents/:id` - Actualizar contenido (admin/contenido)
 *
 * @example
 * ```typescript
 * // Importar en otro módulo
 * @Module({
 *   imports: [CatalogModule],
 * })
 * export class OtroModule {}
 * ```
 *
 * @see {@link CatalogService} para la lógica de negocio del catálogo
 * @see {@link CatalogController} para los endpoints REST expuestos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, ContentEntity, UserEntity]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
