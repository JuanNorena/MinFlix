/**
 * Entidad puente (`CONTENIDOS_GENEROS`) para la relación M:N entre contenidos y géneros.
 *
 * Permite asignar múltiples géneros a un contenido y viceversa,
 * resolviendo la relación muchos-a-muchos entre `CONTENIDOS` y `GENEROS`.
 * Incluye la fecha de asignación para auditoría.
 *
 * @see {@link ContentEntity} para el contenido asociado
 * @see {@link GenreEntity} para el género asociado
 */

/** Decoradores de columnas, relaciones y auditoría de TypeORM */
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

/** Entidad de contenido multimedia */
import { ContentEntity } from './content.entity';

/** Entidad de género cinematográfico */
import { GenreEntity } from './genre.entity';

/**
 * Entidad puente para la relación M:N entre contenidos y géneros.
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
