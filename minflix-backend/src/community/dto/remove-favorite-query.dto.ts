/**
 * DTO de consulta para remover favoritos por perfil.
 *
 * Define el parámetro de consulta que identifica el perfil
 * que eliminará un contenido de sus favoritos.
 *
 * @see {@link CommunityController.removeFavorite} para el endpoint que consume este DTO
 * @see {@link CommunityService.removeFavorite} para la lógica de eliminación
 */

/** Decorador de documentación de propiedades para Swagger */
import { ApiProperty } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, Min } from 'class-validator';

/**
 * DTO de consulta para remover favoritos por perfil.
 */
export class RemoveFavoriteQueryDto {
  /**
   * Perfil que elimina el favorito.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;
}
