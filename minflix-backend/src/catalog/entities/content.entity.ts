/**
 * Entidad de contenidos multimedia (`CONTENIDOS`) del catálogo principal de MinFlix.
 *
 * Representa cualquier elemento disponible para reproducción: películas,
 * series, documentales, podcasts. Incluye metadatos como título, tipo,
 * duración, clasificación por edad, sinopsis y relaciones con categoría,
 * géneros, temporadas, episodios y contenidos relacionados.
 *
 * @see {@link CategoryEntity} para la categoría asignada
 * @see {@link SeasonEntity} para las temporadas (series/podcasts)
 * @see {@link EpisodeEntity} para los episodios de temporadas
 * @see {@link GenreEntity} para los géneros asociados
 * @see {@link RelatedContentEntity} para los contenidos relacionados
 */

/** Decoradores de columnas, relaciones, claves primarias y auditoría de TypeORM */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Entidad de categorías del catálogo */
import { CategoryEntity } from './category.entity';

/** Entidad de usuarios (empleado publicador) */
import { UserEntity } from '../../auth/entities/user.entity';

/** Entidad puente para la relación contenido-género */
import { ContentGenreEntity } from './content-genre.entity';

/** Entidad de temporadas de series y podcasts */
import { SeasonEntity } from './season.entity';

/** Entidad de contenidos relacionados (secuelas, precuelas, etc.) */
import { RelatedContentEntity } from './related-content.entity';

/**
 * Entidad de contenidos multimedia del catálogo principal de MinFlix.
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
