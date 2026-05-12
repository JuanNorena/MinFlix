/**
 * DTO de consulta para la fila de continuar viendo.
 *
 * Define los parámetros de consulta para obtener los contenidos
 * que un perfil ha empezado a ver pero no ha terminado,
 * usados para construir la fila "Continuar viendo" del frontend.
 *
 * @see {@link PlaybackController.listContinueWatching} para el endpoint que consume este DTO
 * @see {@link PlaybackService.listContinueWatching} para la lógica de consulta
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para la fila de continuar viendo.
 */
export class ListContinueWatchingQueryDto {
  /**
   * Identificador del perfil para consultar continuidad.
   */
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Maximo de registros a retornar.
   */
  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
