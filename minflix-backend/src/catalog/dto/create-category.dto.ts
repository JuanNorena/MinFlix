/**
 * DTO para crear categorías del catálogo.
 *
 * Define la estructura y validación de los datos enviados por el cliente
 * al endpoint de creación de categorías en el catálogo multimedia.
 *
 * @see {@link CatalogController} para el endpoint que consume este DTO
 * @see {@link CategoryEntity} para la entidad de categorías en Oracle
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de validación de datos de entrada */
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO para crear categorías del catálogo.
 */
export class CreateCategoryDto {
  /**
   * Nombre comercial de la categoria.
   */
  @ApiProperty({ example: 'Accion' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre!: string;

  /**
   * Descripcion opcional de la categoria.
   */
  @ApiPropertyOptional({
    example: 'Contenido de ritmo rapido y alto conflicto.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(260)
  descripcion?: string;
}
