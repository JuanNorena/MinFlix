import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../auth/entities';

/**
 * Entidad de relacion de referidos entre cuentas de usuario.
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
