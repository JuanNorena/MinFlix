/**
 * Entidad de relación de referidos (`REFERIDOS`) entre cuentas de usuario.
 *
 * Vincula una cuenta referente con una cuenta referida, registrando
 * la fecha, estado de validez y descuento porcentual aplicado.
 *
 * @see {@link UserEntity} para los usuarios referente y referido
 * @see {@link FinanceService} para la lógica de consulta de referidos
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

/** Entidad de usuario (referente y referido) */
import { UserEntity } from '../../auth/entities';

/**
 * Entidad de relación de referidos entre cuentas de usuario.
 */
@Entity({ name: 'REFERIDOS' })
export class ReferralEntity {
  /**
   * Identificador unico del vinculo de referido.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_REFERIDO',
  })
  id!: number;

  /**
   * Cuenta que invita al nuevo usuario.
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'ID_USUARIO_REFERENTE' })
  usuarioReferente!: UserEntity;

  /**
   * Cuenta que se registra mediante referido.
   */
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'ID_USUARIO_REFERIDO' })
  usuarioReferido!: UserEntity;

  /**
   * Fecha de registro del vinculo de referido.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_REFERIDO',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaReferido!: Date;

  /**
   * Estado de validez del referido.
   */
  @Column({
    type: 'varchar2',
    name: 'ESTADO_REFERIDO',
    length: 20,
    default: 'PENDIENTE',
  })
  estadoReferido!: string;

  /**
   * Descuento asignado por la campana de referidos.
   */
  @Column({
    type: 'number',
    name: 'DESCUENTO_PCT',
    precision: 5,
    scale: 2,
    default: 0,
  })
  descuentoPct!: number;
}
