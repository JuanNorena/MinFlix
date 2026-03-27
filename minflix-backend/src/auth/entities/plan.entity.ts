import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

/**
 * Entidad de planes de suscripcion para limites de perfiles y facturacion.
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
