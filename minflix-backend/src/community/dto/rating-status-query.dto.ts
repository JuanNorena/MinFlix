/**
 * DTO para consultar estado de calificación por contenido.
 *
 * Define los parámetros para verificar si un perfil ha calificado
 * un contenido específico y cuál fue el puntaje.
 *
 * @see {@link CommunityController.getRatingStatus} para el endpoint que consume este DTO
 * @see {@link CommunityService.getRatingStatus} para la lógica de consulta
 */

/** Decorador de documentación de propiedades para Swagger */
import { ApiProperty } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, Min } from 'class-validator';

/**
 * DTO para consultar estado de calificación por contenido.
 */
export class RatingStatusQueryDto {
  /**
   * Perfil activo para consultar calificacion.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Contenido consultado.
   */
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contenidoId!: number;
}
