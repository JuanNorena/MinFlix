/**
 * DTO para remover calificaciones por perfil.
 *
 * Define el parámetro de consulta que identifica el perfil
 * que eliminará su calificación de un contenido.
 *
 * @see {@link CommunityController.removeRating} para el endpoint que consume este DTO
 * @see {@link CommunityService.removeRating} para la lógica de eliminación
 */

/** Decorador de documentación de propiedades para Swagger */
import { ApiProperty } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, Min } from 'class-validator';

/**
 * DTO para remover calificaciones por perfil.
 */
export class RemoveRatingQueryDto {
  /**
   * Perfil que elimina la calificacion.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;
}
