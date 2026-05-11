import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SeasonEntity } from './season.entity';

/**
 * Entidad de episodios para temporadas de series y podcasts.
 */
@Entity({ name: 'EPISODIOS' })
export class EpisodeEntity {
  /**
   * Identificador unico del episodio.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_EPISODIO',
  })
  id!: number;

  /**
   * Numero de episodio dentro de la temporada.
   */
  @Column({
    type: 'number',
    name: 'NUMERO_EPISODIO',
    precision: 4,
    scale: 0,
  })
  numeroEpisodio!: number;

  /**
   * Titulo del episodio.
   */
  @Column({
    type: 'varchar2',
    name: 'TITULO',
    length: 180,
  })
  titulo!: string;

  /**
   * Duracion del episodio en minutos.
   */
  @Column({
    type: 'number',
    name: 'DURACION_MINUTOS',
    precision: 5,
    scale: 0,
    nullable: true,
  })
  duracionMinutos?: number;

  /**
   * Sinopsis del episodio.
   */
  @Column({
    type: 'varchar2',
    name: 'SINOPSIS',
    length: 1500,
    nullable: true,
  })
  sinopsis?: string;

  /**
   * Fecha de estreno del episodio.
   */
  @Column({
    type: 'date',
    name: 'FECHA_ESTRENO',
    nullable: true,
  })
  fechaEstreno?: Date;

  /**
   * Fecha de adicion al catalogo.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_ADICION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAdicion!: Date;

  /**
   * Temporada a la que pertenece el episodio.
   */
  @ManyToOne(() => SeasonEntity, (season) => season.episodios)
  @JoinColumn({ name: 'ID_TEMPORADA' })
  temporada!: SeasonEntity;
}
