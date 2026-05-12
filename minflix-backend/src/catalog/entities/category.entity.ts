/**
 * Entidad de categorías (`CATEGORIAS`) para segmentar el catálogo multimedia.
 *
 * Representa una categoría temática que agrupa contenidos en el catálogo
 * de MinFlix. Ejemplos: Películas, Series, Documentales, Podcasts.
 *
 * @see {@link ContentEntity} para los contenidos asociados a esta categoría
 * @see {@link CatalogService} para la gestión de categorías en el catálogo
 */

/** Decoradores de columnas, relaciones y claves primarias de TypeORM */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/** Entidad de contenidos multimedia relacionados */
import { ContentEntity } from './content.entity';

/**
 * Entidad de categorías para segmentar el catálogo multimedia.
 */
@Entity({ name: 'CATEGORIAS' })
export class CategoryEntity {
  /**
   * Identificador unico de la categoria.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_CATEGORIA',
  })
  id!: number;

  /**
   * Nombre visible de la categoria.
   */
  @Column({
    type: 'varchar2',
    name: 'NOMBRE',
    length: 80,
  })
  nombre!: string;

  /**
   * Descripcion funcional de la categoria.
   */
  @Column({
    type: 'varchar2',
    name: 'DESCRIPCION',
    length: 260,
    nullable: true,
  })
  descripcion?: string;

  /**
   * Contenidos asociados a esta categoria.
   */
  @OneToMany(() => ContentEntity, (content) => content.categoria)
  contenidos!: ContentEntity[];
}
