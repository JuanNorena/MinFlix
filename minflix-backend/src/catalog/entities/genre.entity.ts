import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ContentGenreEntity } from './content-genre.entity';

/**
 * Entidad de generos para clasificar contenidos multimedia.
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
