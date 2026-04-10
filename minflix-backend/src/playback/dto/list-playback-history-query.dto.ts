import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para historial de reproduccion por perfil.
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
