import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
