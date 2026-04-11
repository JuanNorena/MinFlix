import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para bandeja de moderacion de reportes.
 */
export class ListModerationReportsQueryDto {
  /**
   * Estado opcional para filtrar bandeja.
   */
  @ApiPropertyOptional({
    example: 'EN_REVISION',
    enum: ['ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'])
  estado?: string;

  /**
   * Limite maximo de filas en bandeja.
   */
  @ApiPropertyOptional({ example: 30, default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
