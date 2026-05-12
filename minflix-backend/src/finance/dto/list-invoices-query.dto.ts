/**
 * DTO de consulta para listado de facturas del usuario autenticado.
 *
 * Define los parámetros de consulta para obtener las facturas de una cuenta,
 * con filtros por año, mes, estado y paginación.
 *
 * @see {@link FinanceController.listInvoices} para el endpoint que consume este DTO
 * @see {@link FinanceService.listInvoices} para la lógica de consulta
 */

/** Decorador de documentación de propiedades opcionales para Swagger */
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de transformación de datos de entrada */
import { Transform, Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para listado de facturas del usuario autenticado.
 */
export class ListInvoicesQueryDto {
  /**
   * Ano opcional del periodo a consultar.
   */
  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2200)
  anio?: number;

  /**
   * Mes opcional del periodo a consultar.
   */
  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  /**
   * Estado opcional de factura para filtrar resultados.
   */
  @ApiPropertyOptional({
    example: 'PENDIENTE',
    enum: ['PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA'])
  estado?: string;

  /**
   * Limite de filas a retornar.
   */
  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  limit?: number;
}
