import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../auth/entities';
import { PaymentEntity } from './payment.entity';

/**
 * Entidad de facturacion mensual por cuenta de usuario.
 */
@Entity({ name: 'FACTURACIONES' })
export class InvoiceEntity {
  /**
   * Identificador unico de la factura.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_FACTURACION',
  })
  id!: number;

  /**
   * Cuenta propietaria de la factura.
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'ID_USUARIO' })
  usuario!: UserEntity;

  /**
   * Ano del periodo de facturacion.
   */
  @Column({
    type: 'number',
    name: 'PERIODO_ANIO',
    precision: 4,
    scale: 0,
  })
  periodoAnio!: number;

  /**
   * Mes del periodo de facturacion (1..12).
   */
  @Column({
    type: 'number',
    name: 'PERIODO_MES',
    precision: 2,
    scale: 0,
  })
  periodoMes!: number;

  /**
   * Fecha de corte para generar la factura.
   */
  @Column({
    type: 'date',
    name: 'FECHA_CORTE',
  })
  fechaCorte!: Date;

  /**
   * Fecha maxima de pago sin mora.
   */
  @Column({
    type: 'date',
    name: 'FECHA_VENCIMIENTO',
  })
  fechaVencimiento!: Date;

  /**
   * Valor base antes de descuentos.
   */
  @Column({
    type: 'number',
    name: 'MONTO_BASE',
    precision: 10,
    scale: 2,
  })
  montoBase!: number;

  /**
   * Porcentaje de descuento por referidos aplicado al periodo.
   */
  @Column({
    type: 'number',
    name: 'DESCUENTO_REFERIDOS_PCT',
    precision: 5,
    scale: 2,
    default: 0,
  })
  descuentoReferidosPct!: number;

  /**
   * Porcentaje de descuento por fidelidad aplicado al periodo.
   */
  @Column({
    type: 'number',
    name: 'DESCUENTO_FIDELIDAD_PCT',
    precision: 5,
    scale: 2,
    default: 0,
  })
  descuentoFidelidadPct!: number;

  /**
   * Valor final calculado despues de descuentos.
   */
  @Column({
    type: 'number',
    name: 'MONTO_FINAL',
    precision: 10,
    scale: 2,
  })
  montoFinal!: number;

  /**
   * Estado del ciclo de factura.
   */
  @Column({
    type: 'varchar2',
    name: 'ESTADO_FACTURA',
    length: 20,
    default: 'PENDIENTE',
  })
  estadoFactura!: string;

  /**
   * Fecha efectiva de pago cuando la factura queda saldada.
   */
  @Column({
    type: 'timestamp',
    name: 'FECHA_PAGO',
    nullable: true,
  })
  fechaPago?: Date;

  /**
   * Pagos asociados a la factura.
   */
  @OneToMany(() => PaymentEntity, (payment) => payment.factura)
  pagos!: PaymentEntity[];
}
