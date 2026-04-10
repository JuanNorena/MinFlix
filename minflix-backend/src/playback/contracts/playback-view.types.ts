/**
 * Vista de evento de reproduccion registrada en el historial.
 */
export interface PlaybackEventView {
  idReproduccion: number;
  perfilId: number;
  contenidoId: number;
  progresoSegundos: number;
  duracionTotalSegundos: number | null;
  porcentajeAvance: number;
  ultimoDispositivo: string | null;
  estadoReproduccion: string;
  fechaInicio: Date;
  fechaUltimoEvento: Date;
  fechaFin: Date | null;
}

/**
 * Vista para la fila de continuar viendo por perfil.
 */
export interface ContinueWatchingView {
  idReproduccion: number;
  perfilId: number;
  contenidoId: number;
  titulo: string;
  clasificacionEdad: string;
  tipoContenido: string;
  progresoSegundos: number;
  duracionTotalSegundos: number | null;
  porcentajeAvance: number;
  ultimoDispositivo: string | null;
  estadoReproduccion: string;
  fechaUltimoEvento: Date;
}

/**
 * Vista del historial de reproduccion por perfil.
 */
export interface PlaybackHistoryItemView {
  idReproduccion: number;
  perfilId: number;
  contenidoId: number;
  titulo: string;
  tipoContenido: string;
  clasificacionEdad: string;
  progresoSegundos: number;
  duracionTotalSegundos: number | null;
  porcentajeAvance: number;
  ultimoDispositivo: string | null;
  estadoReproduccion: string;
  fechaInicio: Date;
  fechaUltimoEvento: Date;
  fechaFin: Date | null;
}
