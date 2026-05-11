import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ContentEntity } from './content.entity';
import { GenreEntity } from './genre.entity';

/**
 * Entidad puente para la relacion M:N entre contenidos y generos.
 */
@Entity({ name: 'CONTENIDOS_GENEROS' })
export class ContentGenreEntity {
  /**
   * Identificador del contenido.
   */
  @PrimaryColumn({
    type: 'number',
    name: 'ID_CONTENIDO',
  })
  idContenido!: number;

  /**
   * Identificador del genero.
   */
  @PrimaryColumn({
    type: 'number',
    name: 'ID_GENERO',
  })
  idGenero!: number;

  /**
   * Fecha de asignacion del genero al contenido.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_ASIGNACION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAsignacion!: Date;

  /**
   * Contenido asociado.
   */
  @ManyToOne(() => ContentEntity, (content) => content.generos)
  @JoinColumn({ name: 'ID_CONTENIDO' })
  contenido!: ContentEntity;

  /**
   * Genero asociado.
   */
  @ManyToOne(() => GenreEntity, (genre) => genre.contenidosGenero)
  @JoinColumn({ name: 'ID_GENERO' })
  genero!: GenreEntity;
}
