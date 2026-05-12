/**
 * DTO de consulta para historial de reproducción por perfil.
 *
 * Define los parámetros de consulta para obtener el historial de reproducción
 * de un perfil específico, con opciones de paginación y filtrado por estado.
 *
 * @see {@link PlaybackController.listPlaybackHistory} para el endpoint que consume este DTO
 * @see {@link PlaybackService.listPlaybackHistory} para la lógica de consulta
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para historial de reproducción por perfil.
 */
export class ListPlaybackHistoryQueryDto {
  /**
   * Perfil a consultar en el historial.
   */
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Maximo de eventos a retornar.
   */
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /**
   * Filtro opcional por estado de reproduccion.
   */
  @ApiPropertyOptional({
    example: 'EN_PROGRESO',
    enum: ['EN_PROGRESO', 'PAUSADO', 'FINALIZADO'],
  })
  @IsOptional()
  @IsIn(['EN_PROGRESO', 'PAUSADO', 'FINALIZADO'])
  estadoReproduccion?: string;
}
