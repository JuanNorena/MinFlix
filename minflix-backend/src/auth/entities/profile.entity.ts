/**
 * Entidad de perfiles de reproducción (`PERFILES`) por cuenta de usuario.
 *
 * Representa un perfil individual dentro de una cuenta principal de MinFlix.
 * Cada cuenta puede tener múltiples perfiles (limitado por el plan de suscripción),
 * y cada perfil tiene su propio nombre, avatar y tipo (adulto o infantil)
 * para aplicar restricciones de clasificación por edad.
 *
 * @see {@link UserEntity} para la cuenta propietaria del perfil
 * @see {@link PlanEntity} para el límite de perfiles permitidos
 * @see {@link AuthService} para la creación, actualización y eliminación de perfiles
 */

// --------------------------------------------------------------------------
// Importaciones de TypeORM para decoradores de entidad y relaciones
// --------------------------------------------------------------------------

/** Decoradores de columnas, relaciones y claves primarias de TypeORM */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Entidad de usuario propietario del perfil */
import { UserEntity } from './user.entity';

/**
 * Entidad de perfiles por cuenta para control de consumo y restricciones.
 */
@Entity({ name: 'PERFILES' })
export class ProfileEntity {
  /**
   * Identificador unico del perfil.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_PERFIL',
  })
  id!: number;

  /**
   * Nombre de visualizacion del perfil.
   */
  @Column({
    type: 'varchar2',
    name: 'NOMBRE',
    length: 80,
  })
  nombre!: string;

  /**
   * URL o identificador del avatar asignado.
   */
  @Column({
    type: 'varchar2',
    name: 'AVATAR',
    length: 255,
    nullable: true,
  })
  avatar?: string;

  /**
   * Tipo de perfil para reglas de restriccion por edad.
   */
  @Column({
    type: 'varchar2',
    name: 'TIPO_PERFIL',
    length: 20,
  })
  tipoPerfil!: string;

  /**
   * Usuario propietario del perfil.
   */
  @ManyToOne(() => UserEntity, (user) => user.perfiles, { nullable: false })
  @JoinColumn({ name: 'ID_USUARIO' })
  usuario!: UserEntity;
}
