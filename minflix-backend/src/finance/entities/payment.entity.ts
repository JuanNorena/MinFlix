/**
 * Entidad de transacciones de pago (`PAGOS`) asociadas a una factura.
 *
 * Representa un pago realizado por un usuario sobre una factura específica.
 * Incluye monto, método de pago, estado de transacción y referencia externa.
 *
 * @see {@link InvoiceEntity} para la factura sobre la que se realiza el pago
 * @see {@link UserEntity} para el usuario que realiza el pago
 * @see {@link FinanceService} para la lógica de procesamiento de pagos
 */

/** Decoradores de columnas, relaciones, claves primarias y auditoría de TypeORM */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Entidad de usuario que realiza el pago */
import { UserEntity } from '../../auth/entities';

/** Entidad de factura sobre la que se realiza el pago */
import { InvoiceEntity } from './invoice.entity';

/**
 * Entidad de transacciones de pago asociadas a una factura.
 */
@Entity({ name: 'PAGOS' })
export class PaymentEntity {
  /**
   * Identificador unico de la transaccion.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_PAGO',
  })
  id!: number;

  /**
   * Factura sobre la que se registra el pago.
   */
  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.pagos, {
    nullable: false,
  })
  @JoinColumn({ name: 'ID_FACTURACION' })
  factura!: InvoiceEntity;

  /**
   * Cuenta que realiza el pago.
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'ID_USUARIO' })
  usuario!: UserEntity;

  /**
   * Fecha y hora en que se registra la transaccion.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_PAGO',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaPago!: Date;

  /**
   * Monto pagado en la transaccion.
   */
  @Column({
    type: 'number',
    name: 'MONTO',
    precision: 10,
    scale: 2,
  })
  monto!: number;

  /**
   * Metodo de pago utilizado por el cliente.
   */
  @Column({
    type: 'varchar2',
    name: 'METODO_PAGO',
    length: 30,
  })
  metodoPago!: string;

  /**
   * Estado final de la transaccion.
   */
  @Column({
    type: 'varchar2',
    name: 'ESTADO_TRANSACCION',
    length: 20,
    default: 'PENDIENTE',
  })
  estadoTransaccion!: string;

  /**
   * Referencia externa de pago para auditoria.
   */
  @Column({
    type: 'varchar2',
    name: 'REFERENCIA_PAGO',
    length: 120,
    nullable: true,
  })
  referenciaPago?: string;
}
