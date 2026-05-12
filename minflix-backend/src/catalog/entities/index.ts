/**
 * Índice de exportación de entidades del módulo de catálogo.
 *
 * Centraliza las exportaciones de todas las entidades del dominio multimedia
 * para que otros módulos puedan importarlas desde una sola ruta.
 */

/** Entidad de categorías (tabla `CATEGORIAS`) */
export { CategoryEntity } from './category.entity';

/** Entidad de contenidos multimedia (tabla `CONTENIDOS`) */
export { ContentEntity } from './content.entity';

/** Entidad puente contenido-género (tabla `CONTENIDOS_GENEROS`) */
export { ContentGenreEntity } from './content-genre.entity';

/** Entidad de episodios (tabla `EPISODIOS`) */
export { EpisodeEntity } from './episode.entity';

/** Entidad de géneros (tabla `GENEROS`) */
export { GenreEntity } from './genre.entity';

/** Entidad de contenidos relacionados (tabla `CONTENIDOS_RELACIONADOS`) */
export { RelatedContentEntity } from './related-content.entity';

/** Entidad de temporadas (tabla `TEMPORADAS`) */
export { SeasonEntity } from './season.entity';
