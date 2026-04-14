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
 * DTO de filtros para el endpoint de analitica de consumo de contenido.
 */
export class AnalyticsConsumptionQueryDto {
  /**
   * Ciudad de residencia del usuario para filtrar el consumo.
   */
  @ApiPropertyOptional({ example: 'Bogota' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ciudad?: string;

  /**
   * Nombre de la categoria de contenido para filtrar.
   */
  @ApiPropertyOptional({ example: 'Peliculas' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  categoria?: string;

  /**
   * Nombre del genero de contenido para filtrar.
   */
  @ApiPropertyOptional({ example: 'Drama' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  genero?: string;

  /**
   * Tipo de dispositivo de reproduccion para filtrar.
   */
  @ApiPropertyOptional({ example: 'movil' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  dispositivo?: string;

  /**
   * Nombre del plan de suscripcion para filtrar.
   */
  @ApiPropertyOptional({ example: 'PREMIUM', enum: ['BASICO', 'ESTANDAR', 'PREMIUM'] })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  plan?: string;

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
