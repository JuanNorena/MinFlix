/**
 * Vista de categoria para contratos de respuesta del catalogo.
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
