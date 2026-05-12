/**
 * Contratos de vistas (types/interfaces) para respuestas del módulo de catálogo.
 *
 * Define las estructuras de datos que retornan los servicios del catálogo
 * al frontend. Cada interfaz representa una vista de lectura optimizada
 * para la UI, con tipos nulables donde la base de datos permite null.
 *
 * @see {@link CatalogService} para los métodos que retornan estas vistas
 * @see {@link CatalogController} para los endpoints que exponen estas vistas
 */

/**
 * Vista de categoría para contratos de respuesta del catálogo.
 */
export interface CatalogCategoryView {
  id: number;
  nombre: string;
  descripcion: string | null;
}

/**
 * Vista de contenido para contratos de respuesta del catalogo.
 */
export interface CatalogContentView {
  id: number;
  titulo: string;
  tipoContenido: string;
  anioLanzamiento: number | null;
  duracionMinutos: number | null;
  sinopsis: string | null;
  clasificacionEdad: string;
  fechaAdicion: Date;
  esExclusivo: boolean;
  empleadoPublicadorId: number | null;
  categoria: CatalogCategoryView;
}

/**
 * Vista de genero para contratos de respuesta del catalogo.
 */
export interface CatalogGenreView {
  id: number;
  nombre: string;
  descripcion: string | null;
}

/**
 * Vista de temporada para contratos de respuesta del catalogo.
 */
export interface CatalogSeasonView {
  id: number;
  numeroTemporada: number;
  titulo: string | null;
  descripcion: string | null;
  fechaEstreno: string | null;
}

/**
 * Vista de episodio para contratos de respuesta del catalogo.
 */
export interface CatalogEpisodeView {
  id: number;
  numeroEpisodio: number;
  titulo: string;
  duracionMinutos: number | null;
  sinopsis: string | null;
  fechaEstreno: string | null;
}

/**
 * Vista de contenido relacionado para contratos de respuesta del catalogo.
 */
export interface CatalogRelatedContentView {
  id: number;
  tipoRelacion: string;
  descripcion: string | null;
  contenidoRelacionado: CatalogContentView;
}
