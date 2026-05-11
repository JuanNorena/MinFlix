import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentEntity } from './content.entity';

/**
 * Entidad de contenidos relacionados (secuelas, precuelas, remakes, etc.).
 */
@Entity({ name: 'CONTENIDOS_RELACIONADOS' })
export class RelatedContentEntity {
  /**
   * Identificador unico de la relacion.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_RELACION',
  })
  id!: number;

  /**
   * Tipo de relacion entre contenidos.
   */
  @Column({
    type: 'varchar2',
    name: 'TIPO_RELACION',
    length: 30,
  })
  tipoRelacion!: string;

  /**
   * Descripcion opcional de la relacion.
   */
  @Column({
    type: 'varchar2',
    name: 'DESCRIPCION',
    length: 260,
    nullable: true,
  })
  descripcion?: string;

  /**
   * Fecha de creacion de la relacion.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_CREACION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaCreacion!: Date;

  /**
   * Contenido origen de la relacion.
   */
  @ManyToOne(() => ContentEntity, { nullable: false })
  @JoinColumn({ name: 'ID_CONTENIDO_ORIGEN' })
  contenidoOrigen!: ContentEntity;

  /**
   * Contenido relacionado destino.
   */
  @ManyToOne(() => ContentEntity, { nullable: false })
  @JoinColumn({ name: 'ID_CONTENIDO_RELACIONADO' })
  contenidoRelacionado!: ContentEntity;
}
