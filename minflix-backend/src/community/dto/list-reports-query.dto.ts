/**
 * DTO de consulta para listar reportes de un perfil.
 *
 * Define los parámetros de consulta para obtener los reportes
 * creados por un perfil, con filtrado por estado y paginación.
 *
 * @see {@link CommunityController.listReports} para el endpoint que consume este DTO
 * @see {@link CommunityService.listReports} para la lógica de consulta
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de transformación de datos de entrada */
import { Transform, Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para listar reportes de un perfil.
 */
export class ListReportsQueryDto {
  /**
   * Perfil propietario del historial consultado.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Estado opcional para filtrar reportes.
   */
  @ApiPropertyOptional({
    example: 'ABIERTO',
    enum: ['ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'])
  estado?: string;

  /**
   * Limite maximo de filas a retornar.
   */
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
