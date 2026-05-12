/**
 * Entidad de cuentas de usuario (`USUARIOS`) para autenticación y control de acceso.
 *
 * Mapea la tabla `USUARIOS` de Oracle en un objeto TypeORM que representa
 * la cuenta principal de un cliente de MinFlix. Incluye datos personales,
 * credenciales de autenticación, rol de autorización, plan de suscripción
 * y la relación con los perfiles de reproducción dependientes.
 *
 * @see {@link PlanEntity} para la entidad del plan de suscripción
 * @see {@link ProfileEntity} para los perfiles dependientes de esta cuenta
 * @see {@link AuthService} para la lógica de registro, login y gestión de perfiles
 */

// --------------------------------------------------------------------------
// Importaciones de TypeORM para decoradores de entidad y relaciones
// --------------------------------------------------------------------------

/** Decoradores de columnas, relaciones y claves primarias de TypeORM */
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

/** Entidad de planes de suscripción relacionada */
import { PlanEntity } from './plan.entity';

/** Entidad de perfiles de reproducción relacionada */
import { ProfileEntity } from './profile.entity';

/**
 * Entidad de cuentas de usuario para autenticación y control de acceso.
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
   * Telefono de contacto del titular de la cuenta.
   */
  @Column({
    type: 'varchar2',
    name: 'TELEFONO',
    length: 30,
  })
  telefono!: string;

  /**
   * Fecha de nacimiento del titular de la cuenta.
   */
  @Column({
    type: 'date',
    name: 'FECHA_NACIMIENTO',
  })
  fechaNacimiento!: Date;

  /**
   * Ciudad de residencia declarada por el titular.
   */
  @Column({
    type: 'varchar2',
    name: 'CIUDAD_RESIDENCIA',
    length: 120,
  })
  ciudadResidencia!: string;

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
