/**
 * DTO de consulta para saber si un contenido ya es favorito.
 *
 * Define los parámetros para verificar si un perfil ha marcado
 * un contenido específico como favorito.
 *
 * @see {@link CommunityController.getFavoriteStatus} para el endpoint que consume este DTO
 * @see {@link CommunityService.getFavoriteStatus} para la lógica de consulta
 */

/** Decorador de documentación de propiedades para Swagger */
import { ApiProperty } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, Min } from 'class-validator';

/**
 * DTO de consulta para saber si un contenido ya es favorito.
 */
export class FavoriteStatusQueryDto {
  /**
   * Perfil activo para evaluar el estado.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Contenido evaluado.
   */
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contenidoId!: number;
}
