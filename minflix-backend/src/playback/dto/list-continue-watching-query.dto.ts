import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
