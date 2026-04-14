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
 * DTO de filtros para el endpoint de analitica financiera ejecutiva.
 */
export class AnalyticsFinanceQueryDto {
  /**
   * Ciudad de residencia para segmentar los ingresos.
   */
  @ApiPropertyOptional({ example: 'Medellin' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ciudad?: string;

  /**
   * Nombre del plan de suscripcion para segmentar los ingresos.
   */
  @ApiPropertyOptional({ example: 'ESTANDAR', enum: ['BASICO', 'ESTANDAR', 'PREMIUM'] })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  plan?: string;

  /**
   * Ano del periodo de facturacion a consultar.
   */
  @ApiPropertyOptional({ example: 2025 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2200)
  anio?: number;

  /**
   * Mes del periodo de facturacion a consultar.
   */
  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  /**
   * Limite de filas a retornar.
   */
  @ApiPropertyOptional({ example: 200, default: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;
}
