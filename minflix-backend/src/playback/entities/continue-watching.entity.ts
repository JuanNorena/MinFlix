import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Entidad de solo lectura para la vista VW_CONTINUAR_VIENDO.
 */
@Entity({ name: 'VW_CONTINUAR_VIENDO' })
export class ContinueWatchingEntity {
  /**
   * Identificador del evento de reproduccion.
   */
  @PrimaryColumn({
    type: 'number',
    name: 'ID_REPRODUCCION',
  })
  idReproduccion!: number;

  /**
   * Identificador del perfil asociado.
   */
  @Column({
    type: 'number',
    name: 'ID_PERFIL',
  })
  perfilId!: number;

  /**
   * Identificador del contenido asociado.
   */
  @Column({
    type: 'number',
    name: 'ID_CONTENIDO',
  })
  contenidoId!: number;

  /**
   * Titulo del contenido.
   */
  @Column({
    type: 'varchar2',
    name: 'TITULO',
    length: 180,
  })
  titulo!: string;

  /**
   * Clasificacion por edad del contenido.
   */
  @Column({
    type: 'varchar2',
    name: 'CLASIFICACION_EDAD',
    length: 10,
  })
  clasificacionEdad!: string;

  /**
   * Tipo de contenido (pelicula, serie, etc.).
   */
  @Column({
    type: 'varchar2',
    name: 'TIPO_CONTENIDO',
    length: 20,
  })
  tipoContenido!: string;

  /**
   * Progreso acumulado en segundos.
   */
  @Column({
    type: 'number',
    name: 'PROGRESO_SEGUNDOS',
    precision: 10,
    scale: 0,
  })
  progresoSegundos!: number;

  /**
   * Duracion total en segundos.
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
   * Avance porcentual de reproduccion.
   */
  @Column({
    type: 'number',
    name: 'PORCENTAJE_AVANCE',
    precision: 5,
    scale: 2,
  })
  porcentajeAvance!: number;

  /**
   * Nombre del ultimo dispositivo usado.
   */
  @Column({
    type: 'varchar2',
    name: 'ULTIMO_DISPOSITIVO',
    length: 80,
    nullable: true,
  })
  ultimoDispositivo?: string;

  /**
   * Estado actual de reproduccion.
   */
  @Column({
    type: 'varchar2',
    name: 'ESTADO_REPRODUCCION',
    length: 20,
  })
  estadoReproduccion!: string;

  /**
   * Fecha del ultimo evento capturado.
   */
  @Column({
    type: 'timestamp',
    name: 'FECHA_ULTIMO_EVENTO',
  })
  fechaUltimoEvento!: Date;

  /**
   * Valor auxiliar de la vista para identificar ultimo evento por contenido.
   */
  @Column({
    type: 'number',
    name: 'RN',
  })
  rn!: number;
}
