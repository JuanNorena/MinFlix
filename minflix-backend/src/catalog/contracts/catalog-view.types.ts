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
