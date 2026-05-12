/**
 * Entidad de planes de suscripción (`PLANES`) para límites de perfiles y facturación.
 *
 * Define los planes comerciales disponibles en MinFlix (Básico, Estándar, Premium),
 * cada uno con un precio mensual y un límite máximo de perfiles por cuenta.
 * Los usuarios se vinculan a un plan al momento del registro.
 *
 * @see {@link UserEntity} para las cuentas asociadas a este plan
 * @see {@link RegisterDto} para la selección de plan durante el registro
 * @see {@link AuthService.register} para la asignación automática de plan
 */

// --------------------------------------------------------------------------
// Importaciones de TypeORM para decoradores de entidad y relaciones
// --------------------------------------------------------------------------

/** Decoradores de columnas, relaciones y claves primarias de TypeORM */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/** Entidad de usuarios suscritos a este plan */
import { UserEntity } from './user.entity';

/**
 * Entidad de planes de suscripción para límites de perfiles y facturación.
 */
@Entity({ name: 'PLANES' })
export class PlanEntity {
  /**
   * Identificador unico del plan.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_PLAN',
  })
  id!: number;

  /**
   * Nombre comercial del plan.
   */
  @Column({
    type: 'varchar2',
    name: 'NOMBRE',
    length: 40,
    unique: true,
  })
  nombre!: string;

  /**
   * Precio mensual del plan.
   */
  @Column({
    type: 'number',
    name: 'PRECIO_MENSUAL',
    precision: 10,
    scale: 2,
  })
  precioMensual!: number;

  /**
   * Limite de perfiles permitidos por cuenta.
   */
  @Column({
    type: 'number',
    name: 'LIMITE_PERFILES',
    precision: 2,
    scale: 0,
  })
  limitePerfiles!: number;

  /**
   * Cuentas de usuario asociadas al plan.
   */
  @OneToMany(() => UserEntity, (user) => user.plan)
  usuarios!: UserEntity[];
}
