/**
 * DTO de consulta para historial de pagos del usuario autenticado.
 *
 * Define los parámetros de consulta para obtener el historial de pagos
 * de una cuenta, con filtrado por estado de transacción y paginación.
 *
 * @see {@link FinanceController.listPayments} para el endpoint que consume este DTO
 * @see {@link FinanceService.listPayments} para la lógica de consulta
 */

/** Decorador de documentación de propiedades opcionales para Swagger */
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de transformación de datos de entrada */
import { Transform, Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para historial de pagos del usuario autenticado.
 */
export class ListPaymentsQueryDto {
  /**
   * Estado opcional de la transaccion de pago.
   */
  @ApiPropertyOptional({
    example: 'EXITOSO',
    enum: ['EXITOSO', 'FALLIDO', 'PENDIENTE', 'REEMBOLSADO'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['EXITOSO', 'FALLIDO', 'PENDIENTE', 'REEMBOLSADO'])
  estadoTransaccion?: string;

  /**
   * Limite maximo de pagos retornados.
   */
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
