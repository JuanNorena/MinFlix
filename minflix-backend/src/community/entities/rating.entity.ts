import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileEntity } from '../../auth/entities';
import { ContentEntity } from '../../catalog/entities';

/**
 * Entidad de calificaciones por perfil y contenido.
 */
@Entity({ name: 'CALIFICACIONES' })
export class RatingEntity {
  /**
   * Identificador unico de la calificacion.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_CALIFICACION',
  })
  id!: number;

  /**
   * Perfil que registra la calificacion.
   */
  @ManyToOne(() => ProfileEntity, { nullable: false })
  @JoinColumn({ name: 'ID_PERFIL' })
  perfil!: ProfileEntity;

  /**
   * Contenido evaluado por el perfil.
   */
  @ManyToOne(() => ContentEntity, { nullable: false })
  @JoinColumn({ name: 'ID_CONTENIDO' })
  contenido!: ContentEntity;

  /**
   * Puntaje de 1 a 5 estrellas.
   */
  @Column({
    type: 'number',
    name: 'PUNTAJE',
    precision: 1,
    scale: 0,
  })
  puntaje!: number;

  /**
   * Reseña opcional asociada al puntaje.
   */
  @Column({
    type: 'varchar2',
    name: 'RESENA',
    length: 1000,
    nullable: true,
  })
  resena?: string;

  /**
   * Fecha en que se registra o actualiza la calificacion.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_CALIFICACION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCalificacion!: Date;
}
