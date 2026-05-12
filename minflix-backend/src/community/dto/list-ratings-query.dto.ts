/**
 * DTO de consulta para listar calificaciones por perfil.
 *
 * Define los parámetros de consulta para obtener las calificaciones
 * emitidas por un perfil, con opciones de paginación.
 *
 * @see {@link CommunityController.listRatings} para el endpoint que consume este DTO
 * @see {@link CommunityService.listRatings} para la lógica de consulta
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para listar calificaciones por perfil.
 */
export class ListRatingsQueryDto {
  /**
   * Perfil a consultar.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Limite maximo de calificaciones a retornar.
   */
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
