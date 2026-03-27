import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanEntity } from './plan.entity';
import { ProfileEntity } from './profile.entity';

/**
 * Entidad de cuentas de usuario para autenticacion y control de acceso.
 */
@Entity({ name: 'USUARIOS' })
export class UserEntity {
  /**
   * Identificador unico del usuario.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_USUARIO',
  })
  id!: number;

  /**
   * Nombre completo del titular de la cuenta.
   */
  @Column({
    type: 'varchar2',
    name: 'NOMBRE',
    length: 120,
  })
  nombre!: string;

  /**
   * Correo unico de autenticacion.
   */
  @Column({
    type: 'varchar2',
    name: 'EMAIL',
    length: 180,
    unique: true,
  })
  email!: string;

  /**
   * Hash seguro de la contrasena.
   */
  @Column({
    type: 'varchar2',
    name: 'PASSWORD_HASH',
    length: 255,
  })
  passwordHash!: string;

  /**
   * Rol de autorizacion de la cuenta.
   */
  @Column({
    type: 'varchar2',
    name: 'ROL',
    length: 30,
    default: 'usuario',
  })
  rol!: string;

  /**
   * Estado general de la cuenta para control de reproduccion y acceso.
   */
  @Column({
    type: 'varchar2',
    name: 'ESTADO_CUENTA',
    length: 20,
    default: 'ACTIVO',
  })
  estadoCuenta!: string;

  /**
   * Plan de suscripcion asociado a la cuenta.
   */
  @ManyToOne(() => PlanEntity, (plan) => plan.usuarios, { nullable: true })
  @JoinColumn({ name: 'ID_PLAN' })
  plan?: PlanEntity;

  /**
   * Perfiles dependientes de la cuenta principal.
   */
  @OneToMany(() => ProfileEntity, (profile) => profile.usuario)
  perfiles!: ProfileEntity[];

  /**
   * Fecha de creacion del registro.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_CREACION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion!: Date;

  /**
   * Fecha de ultima actualizacion del registro.
   */
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'FECHA_ACTUALIZACION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaActualizacion!: Date;
}
