import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { ContentGenreEntity } from './content-genre.entity';
import { SeasonEntity } from './season.entity';
import { RelatedContentEntity } from './related-content.entity';

/**
 * Entidad de contenidos multimedia del catalogo principal de MinFlix.
 */
@Entity({ name: 'CONTENIDOS' })
export class ContentEntity {
  /**
   * Identificador unico del contenido.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_CONTENIDO',
  })
  id!: number;

  /**
   * Titulo publico del contenido.
   */
  @Column({
    type: 'varchar2',
    name: 'TITULO',
    length: 180,
  })
  titulo!: string;

  /**
   * Tipo de contenido segun la taxonomia funcional.
   */
  @Column({
    type: 'varchar2',
    name: 'TIPO_CONTENIDO',
    length: 20,
  })
  tipoContenido!: string;

  /**
   * Ano de lanzamiento del contenido.
   */
  @Column({
    type: 'number',
    name: 'ANIO_LANZAMIENTO',
    precision: 4,
    scale: 0,
    nullable: true,
  })
  anioLanzamiento?: number;

  /**
   * Duracion del contenido en minutos.
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
   * Resumen narrativo del contenido.
   */
  @Column({
    type: 'varchar2',
    name: 'SINOPSIS',
    length: 1500,
    nullable: true,
  })
  sinopsis?: string;

  /**
   * Clasificacion por edad para control de acceso.
   */
  @Column({
    type: 'varchar2',
    name: 'CLASIFICACION_EDAD',
    length: 10,
  })
  clasificacionEdad!: string;

  /**
   * Fecha de ingreso al catalogo.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_ADICION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaAdicion!: Date;

  /**
   * Bandera de exclusividad (0 = no, 1 = si).
   */
  @Column({
    type: 'number',
    name: 'ES_EXCLUSIVO',
    precision: 1,
    scale: 0,
    default: 0,
  })
  esExclusivo!: number;

  /**
   * Categoria principal asignada al contenido.
   */
  @ManyToOne(() => CategoryEntity, (category) => category.contenidos, {
    nullable: false,
  })
  @JoinColumn({ name: 'ID_CATEGORIA' })
  categoria!: CategoryEntity;

  /**
   * Empleado de contenido que publico el registro.
   */
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'ID_EMPLEADO_PUBLICADOR' })
  empleadoPublicador?: UserEntity;

  /**
   * Generos asignados al contenido.
   */
  @OneToMany(() => ContentGenreEntity, (cg) => cg.contenido)
  generos!: ContentGenreEntity[];

  /**
   * Temporadas del contenido (series y podcasts).
   */
  @OneToMany(() => SeasonEntity, (season) => season.contenido)
  temporadas!: SeasonEntity[];

  /**
   * Relaciones de contenido origen.
   */
  @OneToMany(() => RelatedContentEntity, (rc) => rc.contenidoOrigen)
  relacionadosOrigen!: RelatedContentEntity[];

  /**
   * Relaciones de contenido destino.
   */
  @OneToMany(() => RelatedContentEntity, (rc) => rc.contenidoRelacionado)
  relacionadosDestino!: RelatedContentEntity[];
}
