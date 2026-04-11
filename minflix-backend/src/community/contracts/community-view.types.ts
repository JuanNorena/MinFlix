/**
 * Vista de categoria embebida en respuestas de comunidad.
 */
export interface CommunityCategoryView {
  id: number;
  nombre: string;
  descripcion: string | null;
}

/**
 * Vista de favorito por perfil.
 */
export interface FavoriteItemView {
  idFavorito: number;
  perfilId: number;
  contenidoId: number;
  titulo: string;
  tipoContenido: string;
  clasificacionEdad: string;
  categoria: CommunityCategoryView;
  fechaAdicion: Date;
}

/**
 * Vista de estado de favorito para un contenido puntual.
 */
export interface FavoriteStatusView {
  perfilId: number;
  contenidoId: number;
  esFavorito: boolean;
}

/**
 * Vista de calificacion por perfil.
 */
export interface RatingItemView {
  idCalificacion: number;
  perfilId: number;
  contenidoId: number;
  titulo: string;
  tipoContenido: string;
  clasificacionEdad: string;
  categoria: CommunityCategoryView;
  puntaje: number;
  resena: string | null;
  fechaCalificacion: Date;
}

/**
 * Vista de estado de calificacion para un contenido puntual.
 */
export interface RatingStatusView {
  perfilId: number;
  contenidoId: number;
  tieneCalificacion: boolean;
  puntaje: number | null;
  resena: string | null;
}
