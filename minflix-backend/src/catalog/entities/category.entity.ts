import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ContentEntity } from './content.entity';

/**
 * Entidad de categorias para segmentar el catalogo multimedia.
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
