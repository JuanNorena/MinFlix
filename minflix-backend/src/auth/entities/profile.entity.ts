import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
