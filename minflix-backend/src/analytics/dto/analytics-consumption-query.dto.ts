/**
 * DTO de filtros para el endpoint de analítica de consumo de contenido.
 *
 * Define los parámetros de consulta para filtrar la vista `VW_ANALITICA_CONSUMO`
 * por ciudad, categoría, género, dispositivo, plan y límite de filas.
 *
 * @see {@link AnalyticsController.getConsumption} para el endpoint que consume este DTO
 * @see {@link AnalyticsService.getConsumption} para la lógica de consulta
 */

/** Decorador de documentación de propiedades opcionales para Swagger */
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de transformación de datos de entrada */
import { Transform, Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO de filtros para el endpoint de analítica de consumo de contenido.
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
  @ApiPropertyOptional({
    example: 'PREMIUM',
    enum: ['BASICO', 'ESTANDAR', 'PREMIUM'],
  })
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
