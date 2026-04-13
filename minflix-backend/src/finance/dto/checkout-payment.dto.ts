import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * DTO para ejecutar un pago simulado con tarjeta desde la UI.
 */
export class CheckoutPaymentDto {
  /**
   * Identificador de factura pendiente o vencida que sera pagada.
   */
  @ApiProperty({ example: 1201 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idFacturacion!: number;

  /**
   * Metodo de pago simulado (sin integracion con pasarela real).
   */
  @ApiProperty({
    example: 'TARJETA_CREDITO',
    enum: ['TARJETA_CREDITO', 'TARJETA_DEBITO'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsIn(['TARJETA_CREDITO', 'TARJETA_DEBITO'])
  metodoPago!: 'TARJETA_CREDITO' | 'TARJETA_DEBITO';

  /**
   * Nombre del titular de la tarjeta ingresado por el usuario.
   */
  @ApiProperty({ example: 'Laura Mendoza' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  titularTarjeta!: string;

  /**
   * Numero de tarjeta ingresado para simulacion de compra.
   */
  @ApiProperty({ example: '4111111111111111' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '') : value,
  )
  @IsString()
  @Matches(/^[0-9]{12,19}$/)
  numeroTarjeta!: string;

  /**
   * Fecha de expiracion en formato MM/YY.
   */
  @ApiProperty({ example: '11/29' })
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)
  fechaExpiracion!: string;

  /**
   * Codigo de seguridad CVV para formulario simulado.
   */
  @ApiProperty({ example: '123' })
  @IsString()
  @Matches(/^[0-9]{3,4}$/)
  cvv!: string;
}
