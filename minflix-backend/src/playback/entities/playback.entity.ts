import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentEntity } from '../../catalog/entities';
import { ProfileEntity } from '../../auth/entities';

/**
 * Entidad de eventos de reproduccion por perfil y contenido.
 */
@Entity({ name: 'REPRODUCCIONES' })
export class PlaybackEntity {
  /**
   * Identificador unico del evento de reproduccion.
   */
  @PrimaryGeneratedColumn({
    type: 'number',
    name: 'ID_REPRODUCCION',
  })
  id!: number;

  /**
   * Perfil que genera el evento de reproduccion.
   */
  @ManyToOne(() => ProfileEntity, { nullable: false })
  @JoinColumn({ name: 'ID_PERFIL' })
  perfil!: ProfileEntity;

  /**
   * Contenido asociado al evento de reproduccion.
   */
  @ManyToOne(() => ContentEntity, { nullable: false })
  @JoinColumn({ name: 'ID_CONTENIDO' })
  contenido!: ContentEntity;

  /**
   * Progreso acumulado en segundos.
   */
  @Column({
    type: 'number',
    name: 'PROGRESO_SEGUNDOS',
    precision: 10,
    scale: 0,
    default: 0,
  })
  progresoSegundos!: number;

  /**
   * Duracion total del contenido en segundos.
   */
  @Column({
    type: 'number',
    name: 'DURACION_TOTAL_SEGUNDOS',
    precision: 10,
    scale: 0,
    nullable: true,
  })
  duracionTotalSegundos?: number;

  /**
   * Avance porcentual calculado por trigger de Oracle.
   */
  @Column({
    type: 'number',
    name: 'PORCENTAJE_AVANCE',
    precision: 5,
    scale: 2,
    default: 0,
  })
  porcentajeAvance!: number;

  /**
   * Dispositivo mas reciente desde el cual se reprodujo.
   */
  @Column({
    type: 'varchar2',
    name: 'ULTIMO_DISPOSITIVO',
    length: 80,
    nullable: true,
  })
  ultimoDispositivo?: string;

  /**
   * Estado actual del evento de reproduccion.
   */
  @Column({
    type: 'varchar2',
    name: 'ESTADO_REPRODUCCION',
    length: 20,
    default: 'EN_PROGRESO',
  })
  estadoReproduccion!: string;

  /**
   * Fecha de inicio del evento.
   */
  @CreateDateColumn({
    type: 'timestamp',
    name: 'FECHA_INICIO',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaInicio!: Date;

  /**
   * Fecha del ultimo evento de reproduccion.
   */
  @Column({
    type: 'timestamp',
    name: 'FECHA_ULTIMO_EVENTO',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaUltimoEvento!: Date;

  /**
   * Fecha de finalizacion cuando el contenido termina.
   */
  @Column({
    type: 'timestamp',
    name: 'FECHA_FIN',
    nullable: true,
  })
  fechaFin?: Date;
}
