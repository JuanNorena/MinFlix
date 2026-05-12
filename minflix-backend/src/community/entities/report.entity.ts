/**
 * Entidad de reportes (`REPORTES`) de comunidad para flujo de moderación.
 *
 * Permite que los perfiles reporten contenidos inapropiados,
 * activando un flujo de moderación con estados (ABIERTO, EN_REVISION, CERRADO)
 * y asignación de moderadores.
 *
 * @see {@link ProfileEntity} para el perfil que reporta
 * @see {@link UserEntity} para el moderador asignado
 * @see {@link ContentEntity} para el contenido reportado
 * @see {@link CommunityService} para la gestión de reportes
 */

/** Decoradores de columnas, relaciones, claves primarias y auditoría de TypeORM */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Entidades de perfil y usuario (moderador) */
import { ProfileEntity, UserEntity } from '../../auth/entities';

/** Entidad de contenido multimedia */
import { ContentEntity } from '../../catalog/entities';

/**
 * Entidad de reportes de comunidad para flujo de moderación.
 */
@Entity({ name: 'REPORTES' })
export class ReportEntity {
  /**
   * Identificador unico del reporte.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_REPORTE',
  })
  id!: number;

  /**
   * Perfil que origina el reporte.
   */
  @ManyToOne(() => ProfileEntity, { nullable: false })
  @JoinColumn({ name: 'ID_PERFIL_REPORTADOR' })
  perfilReportador!: ProfileEntity;

  /**
   * Contenido reportado por el perfil.
   */
  @ManyToOne(() => ContentEntity, { nullable: false })
  @JoinColumn({ name: 'ID_CONTENIDO' })
  contenido!: ContentEntity;

  /**
   * Motivo principal declarado por el usuario.
   */
  @Column({
    type: 'varchar2',
    name: 'MOTIVO',
    length: 120,
  })
  motivo!: string;

  /**
   * Detalle opcional del caso reportado.
   */
  @Column({
    type: 'varchar2',
    name: 'DETALLE',
    length: 1000,
    nullable: true,
  })
  detalle?: string;

  /**
   * Estado del ciclo de vida del reporte.
   */
  @Column({
    type: 'varchar2',
    name: 'ESTADO_REPORTE',
    length: 20,
    default: 'ABIERTO',
  })
  estadoReporte!: string;

  /**
   * Usuario moderador asignado para gestion del caso.
   */
  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'ID_USUARIO_MODERADOR' })
  usuarioModerador?: UserEntity;

  /**
   * Texto de resolucion emitido por soporte/admin.
   */
  @Column({
    type: 'varchar2',
    name: 'RESOLUCION',
    length: 1000,
    nullable: true,
  })
  resolucion?: string;

  /**
   * Fecha de creacion del reporte.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_REPORTE',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaReporte!: Date;

  /**
   * Fecha de ultima actualizacion del reporte.
   */
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'FECHA_ACTUALIZACION',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaActualizacion!: Date;

  /**
   * Fecha de cierre del reporte cuando aplica.
   */
  @Column({
    type: 'timestamp',
    name: 'FECHA_RESOLUCION',
    nullable: true,
  })
  fechaResolucion?: Date;
}
