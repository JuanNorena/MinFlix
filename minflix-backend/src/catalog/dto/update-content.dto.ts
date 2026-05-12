/**
 * DTO para actualización parcial de contenidos.
 *
 * Extiende {@link CreateContentDto} con todas las propiedades opcionales
 * usando `PartialType`, permitiendo actualizar solo los campos deseados.
 *
 * @see {@link CatalogController} para el endpoint que consume este DTO
 * @see {@link CreateContentDto} para el DTO base con la estructura completa
 */

/** Utilidad de Swagger para hacer opcionales todas las propiedades de un DTO */
import { PartialType } from '@nestjs/swagger';

/** DTO base con la estructura completa de creación de contenido */
import { CreateContentDto } from './create-content.dto';

/**
 * DTO para actualización parcial de contenidos.
 */
export class UpdateContentDto extends PartialType(CreateContentDto) {}
