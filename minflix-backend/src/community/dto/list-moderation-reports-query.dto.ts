/**
 * DTO de consulta para bandeja de moderación de reportes.
 *
 * Define los parámetros de consulta para obtener la bandeja de moderación
 * de reportes de contenido, con filtrado por estado y paginación.
 *
 * @see {@link CommunityController.listModerationReports} para el endpoint que consume este DTO
 * @see {@link CommunityService.listModerationReports} para la lógica de consulta
 */

/** Decorador de documentación de propiedades opcionales para Swagger */
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de transformación de datos de entrada */
import { Transform, Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para bandeja de moderación de reportes.
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
