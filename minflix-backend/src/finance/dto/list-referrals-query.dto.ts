/**
 * DTO de consulta para listar relaciones de referidos.
 *
 * Define los parámetros de consulta para obtener las relaciones de referidos
 * de una cuenta, con filtrado por tipo de relación, estado y paginación.
 *
 * @see {@link FinanceController.listReferrals} para el endpoint que consume este DTO
 * @see {@link FinanceService.listReferrals} para la lógica de consulta
 */

/** Decorador de documentación de propiedades opcionales para Swagger */
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de transformación de datos de entrada */
import { Transform, Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para listar relaciones de referidos.
 */
export class ListReferralsQueryDto {
  /**
   * Tipo de relacion que se desea consultar.
   */
  @ApiPropertyOptional({
    example: 'TODOS',
    enum: ['TODOS', 'REFERENTE', 'REFERIDO'],
    default: 'TODOS',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['TODOS', 'REFERENTE', 'REFERIDO'])
  tipoRelacion?: 'TODOS' | 'REFERENTE' | 'REFERIDO';

  /**
   * Estado opcional del referido para filtrar resultados.
   */
  @ApiPropertyOptional({
    example: 'VALIDADO',
    enum: ['PENDIENTE', 'VALIDADO', 'ANULADO'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['PENDIENTE', 'VALIDADO', 'ANULADO'])
  estado?: string;

  /**
   * Limite maximo de registros retornados.
   */
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
