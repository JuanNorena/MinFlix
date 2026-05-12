/**
 * Entidad de géneros (`GENEROS`) para clasificar contenidos multimedia.
 *
 * Representa un género cinematográfico o temático que puede asignarse
 * a múltiples contenidos. Ejemplos: Acción, Drama, Comedia, Terror.
 *
 * @see {@link ContentGenreEntity} para la relación puente con contenidos
 * @see {@link ContentEntity} para los contenidos clasificados con este género
 */

/** Decoradores de columnas, relaciones y claves primarias de TypeORM */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/** Entidad puente para la relación contenido-género */
import { ContentGenreEntity } from './content-genre.entity';

/**
 * Entidad de géneros para clasificar contenidos multimedia.
 */
@Entity({ name: 'GENEROS' })
export class GenreEntity {
  /**
   * Identificador unico del genero.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_GENERO',
  })
  id!: number;

  /**
   * Nombre visible del genero.
   */
  @Column({
    type: 'varchar2',
    name: 'NOMBRE',
    length: 80,
  })
  nombre!: string;

  /**
   * Descripcion funcional del genero.
   */
  @Column({
    type: 'varchar2',
    name: 'DESCRIPCION',
    length: 260,
    nullable: true,
  })
  descripcion?: string;

  /**
   * Relaciones de contenidos asignados a este genero.
   */
  @OneToMany(() => ContentGenreEntity, (cg) => cg.genero)
  contenidosGenero!: ContentGenreEntity[];
}
