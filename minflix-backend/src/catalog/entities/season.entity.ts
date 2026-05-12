/**
 * Entidad de temporadas (`TEMPORADAS`) para series y podcasts.
 *
 * Representa una temporada dentro de un contenido serializado.
 * Contiene metadatos como número de temporada, título, descripción
 * y fecha de estreno, y se relaciona con los episodios que la componen.
 *
 * @see {@link ContentEntity} para el contenido padre de la temporada
 * @see {@link EpisodeEntity} para los episodios de esta temporada
 */

/** Decoradores de columnas, relaciones y claves primarias de TypeORM */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Entidad de contenido multimedia padre */
import { ContentEntity } from './content.entity';

/** Entidad de episodios de la temporada */
import { EpisodeEntity } from './episode.entity';

/**
 * Entidad de temporadas para series y podcasts.
 */
@Entity({ name: 'TEMPORADAS' })
export class SeasonEntity {
  /**
   * Identificador unico de la temporada.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_TEMPORADA',
  })
  id!: number;

  /**
   * Numero de temporada dentro del contenido.
   */
  @Column({
    type: 'number',
    name: 'NUMERO_TEMPORADA',
    precision: 3,
    scale: 0,
  })
  numeroTemporada!: number;

  /**
   * Titulo de la temporada.
   */
  @Column({
    type: 'varchar2',
    name: 'TITULO',
    length: 180,
    nullable: true,
  })
  titulo?: string;

  /**
   * Descripcion de la temporada.
   */
  @Column({
    type: 'varchar2',
    name: 'DESCRIPCION',
    length: 1500,
    nullable: true,
  })
  descripcion?: string;

  /**
   * Fecha de estreno de la temporada.
   */
  @Column({
    type: 'date',
    name: 'FECHA_ESTRENO',
    nullable: true,
  })
  fechaEstreno?: Date;

  /**
   * Contenido al que pertenece la temporada.
   */
  @ManyToOne(() => ContentEntity, (content) => content.temporadas)
  @JoinColumn({ name: 'ID_CONTENIDO' })
  contenido!: ContentEntity;

  /**
   * Episodios de la temporada.
   */
  @OneToMany(() => EpisodeEntity, (episode) => episode.temporada)
  episodios!: EpisodeEntity[];
}
