import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO de filtros para el endpoint de rendimiento interno del equipo.
 */
export class AnalyticsPerformanceQueryDto {
  /**
   * Nombre del departamento para filtrar el rendimiento.
   */
  @ApiPropertyOptional({
    example: 'Contenido',
    enum: ['Tecnologia', 'Contenido', 'Marketing', 'Soporte', 'Finanzas'],
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  departamento?: string;

  /**
   * Ano de ingreso del empleado para agrupar cohortes.
   */
  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2200)
  anio?: number;

  /**
   * Limite de filas a retornar.
   */
  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
