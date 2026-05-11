import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import {
  CategoryEntity,
  ContentEntity,
  ContentGenreEntity,
  EpisodeEntity,
  GenreEntity,
  RelatedContentEntity,
  SeasonEntity,
} from './entities';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { ListContentQueryDto } from './dto/list-content-query.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import {
  CatalogCategoryView,
  CatalogContentView,
  CatalogEpisodeView,
  CatalogGenreView,
  CatalogRelatedContentView,
  CatalogSeasonView,
} from './contracts/catalog-view.types';

/**
 * Servicio de catálogo para la gestión de contenidos multimedia y categorías.
 *
 * Este servicio implementa la lógica de negocio para administrar el catálogo
 * completo de MinFlix, incluyendo la creación, actualización, búsqueda y
 * clasificación de contenidos multimedia.
 *
 * @remarks
 * **Responsabilidades principales:**
 *
 * 1. **Gestión de Categorías:**
 *    - Listar todas las categorías disponibles
 *    - Crear nuevas categorías validando unicidad de nombre
 *
 * 2. **Gestión de Contenidos:**
 *    - Listar contenidos con filtros opcionales (búsqueda, tipo, categoría, edad)
 *    - Consultar detalle de contenido individual
 *    - Crear nuevos contenidos con validación de categoría y publicador
 *    - Actualizar contenidos existentes de forma parcial
 *
 * 3. **Búsqueda y Filtrado:**
 *    - Búsqueda por texto en título (case-insensitive)
 *    - Filtrado por tipo de contenido (película, serie, documental, música, podcast)
 *    - Filtrado por clasificación de edad (Todos, +7, +13, +16, +18)
 *    - Filtrado por categoría específica
 *    - Filtrado por contenido exclusivo de MinFlix
 *
 * 4. **Normalización de Datos:**
 *    - Mapeo de entidades TypeORM a contratos de API limpios
 *    - Transformación de campos booleanos numéricos de Oracle (0/1) a boolean
 *
 * @example
 * ```typescript
 * // Listar contenidos con filtros
 * const contenidos = await catalogService.listContents({
 *   search: 'Star Wars',
 *   tipoContenido: 'PELICULA',
 *   clasificacionEdad: '+13',
 *   limit: 24
 * });
 *
 * // Crear nuevo contenido
 * const nuevoContenido = await catalogService.createContent({
 *   titulo: 'El Padrino',
 *   tipoContenido: 'PELICULA',
 *   clasificacionEdad: '+16',
 *   categoriaId: 5,
 *   anioLanzamiento: 1972,
 *   duracionMinutos: 175,
 *   sinopsis: 'La historia de una familia mafiosa...',
 *   esExclusivo: false
 * }, usuarioPublicadorId);
 * ```
 *
 * @see {@link ContentEntity} para la estructura de contenidos en Oracle
 * @see {@link CategoryEntity} para la estructura de categorías en Oracle
 * @see {@link CatalogController} para los endpoints que exponen esta funcionalidad
 */
@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GenreEntity)
    private readonly genreRepository: Repository<GenreEntity>,
    @InjectRepository(ContentGenreEntity)
    private readonly contentGenreRepository: Repository<ContentGenreEntity>,
    @InjectRepository(SeasonEntity)
    private readonly seasonRepository: Repository<SeasonEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
    @InjectRepository(RelatedContentEntity)
    private readonly relatedContentRepository: Repository<RelatedContentEntity>,
  ) {}

  /**
   * Lista categorias disponibles para clasificar contenidos.
   * @returns Coleccion de categorias ordenadas por nombre.
   */
  async listCategories(): Promise<CatalogCategoryView[]> {
    const categories = await this.categoryRepository
      .createQueryBuilder('categoria')
      .orderBy('categoria.nombre', 'ASC')
      .getMany();

    return categories.map((category) => this.mapCategory(category));
  }

  /**
   * Crea una categoria de catalogo.
   * @param payload - Datos de creacion de la categoria.
   * @returns Categoria creada.
   */
  async createCategory(
    payload: CreateCategoryDto,
  ): Promise<CatalogCategoryView> {
    const existingCategory = await this.categoryRepository
      .createQueryBuilder('categoria')
      .where('UPPER(categoria.nombre) = UPPER(:nombre)', {
        nombre: payload.nombre,
      })
      .getOne();

    if (existingCategory) {
      throw new BadRequestException(
        'Ya existe una categoria con ese nombre en el catalogo',
      );
    }

    const savedCategory = await this.categoryRepository.save(
      this.categoryRepository.create({
        nombre: payload.nombre.trim(),
        descripcion: payload.descripcion?.trim(),
      }),
    );

    return this.mapCategory(savedCategory);
  }

  /**
   * Lista contenidos aplicando filtros de consulta opcionales.
   * @param query - Filtros de listado de catalogo.
   * @returns Coleccion de contenidos normalizada para la API.
   */
  async listContents(
    query: ListContentQueryDto,
  ): Promise<CatalogContentView[]> {
    const queryBuilder = this.contentRepository
      .createQueryBuilder('contenido')
      .innerJoinAndSelect('contenido.categoria', 'categoria')
      .leftJoinAndSelect('contenido.empleadoPublicador', 'empleadoPublicador')
      .orderBy('contenido.fechaAdicion', 'DESC');

    if (query.search) {
      queryBuilder.andWhere('UPPER(contenido.titulo) LIKE UPPER(:search)', {
        search: `%${query.search.trim()}%`,
      });
    }

    if (query.tipoContenido) {
      queryBuilder.andWhere('contenido.tipoContenido = :tipoContenido', {
        tipoContenido: query.tipoContenido,
      });
    }

    if (query.clasificacionEdad) {
      queryBuilder.andWhere(
        'contenido.clasificacionEdad = :clasificacionEdad',
        {
          clasificacionEdad: query.clasificacionEdad,
        },
      );
    }

    if (query.categoriaId) {
      queryBuilder.andWhere('categoria.id = :categoriaId', {
        categoriaId: query.categoriaId,
      });
    }

    if (query.exclusivo !== undefined) {
      queryBuilder.andWhere('contenido.esExclusivo = :esExclusivo', {
        esExclusivo: query.exclusivo ? 1 : 0,
      });
    }

    queryBuilder.take(query.limit ?? 24);

    const contents = await queryBuilder.getMany();

    return contents.map((content) => this.mapContent(content));
  }

  /**
   * Consulta el detalle de un contenido por identificador.
   * @param contentId - Identificador del contenido.
   * @returns Contenido detallado.
   */
  async getContentById(contentId: number): Promise<CatalogContentView> {
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
      relations: { categoria: true, empleadoPublicador: true },
    });

    if (!content) {
      throw new NotFoundException('Contenido no encontrado en el catalogo');
    }

    return this.mapContent(content);
  }

  /**
   * Crea un contenido nuevo en el catalogo.
   * @param payload - Datos del contenido a crear.
   * @param editorUserId - Usuario autenticado que publica el contenido.
   * @returns Contenido creado.
   */
  async createContent(
    payload: CreateContentDto,
    editorUserId: number,
  ): Promise<CatalogContentView> {
    const category = await this.categoryRepository.findOne({
      where: { id: payload.categoriaId },
    });

    if (!category) {
      throw new BadRequestException('La categoria seleccionada no existe');
    }

    const editorUser = await this.userRepository.findOne({
      where: { id: editorUserId },
    });

    if (!editorUser) {
      throw new NotFoundException('Usuario publicador no encontrado');
    }

    const savedContent = await this.contentRepository.save(
      this.contentRepository.create({
        titulo: payload.titulo.trim(),
        tipoContenido: payload.tipoContenido,
        clasificacionEdad: payload.clasificacionEdad,
        categoria: category,
        empleadoPublicador: editorUser,
        anioLanzamiento: payload.anioLanzamiento,
        duracionMinutos: payload.duracionMinutos,
        sinopsis: payload.sinopsis?.trim(),
        esExclusivo: payload.esExclusivo ? 1 : 0,
      }),
    );

    const hydratedContent = await this.contentRepository.findOne({
      where: { id: savedContent.id },
      relations: { categoria: true, empleadoPublicador: true },
    });

    if (!hydratedContent) {
      throw new NotFoundException(
        'No fue posible reconstruir el contenido creado',
      );
    }

    return this.mapContent(hydratedContent);
  }

  /**
   * Actualiza campos editables de un contenido existente.
   * @param contentId - Identificador del contenido.
   * @param payload - Datos de actualizacion parcial.
   * @returns Contenido actualizado.
   */
  async updateContent(
    contentId: number,
    payload: UpdateContentDto,
  ): Promise<CatalogContentView> {
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
      relations: { categoria: true, empleadoPublicador: true },
    });

    if (!content) {
      throw new NotFoundException('Contenido no encontrado para actualizacion');
    }

    if (
      payload.titulo === undefined &&
      payload.tipoContenido === undefined &&
      payload.clasificacionEdad === undefined &&
      payload.categoriaId === undefined &&
      payload.anioLanzamiento === undefined &&
      payload.duracionMinutos === undefined &&
      payload.sinopsis === undefined &&
      payload.esExclusivo === undefined
    ) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar el contenido',
      );
    }

    if (payload.categoriaId !== undefined) {
      const category = await this.categoryRepository.findOne({
        where: { id: payload.categoriaId },
      });

      if (!category) {
        throw new BadRequestException('La categoria seleccionada no existe');
      }

      content.categoria = category;
    }

    if (payload.titulo !== undefined) {
      content.titulo = payload.titulo.trim();
    }

    if (payload.tipoContenido !== undefined) {
      content.tipoContenido = payload.tipoContenido;
    }

    if (payload.clasificacionEdad !== undefined) {
      content.clasificacionEdad = payload.clasificacionEdad;
    }

    if (payload.anioLanzamiento !== undefined) {
      content.anioLanzamiento = payload.anioLanzamiento;
    }

    if (payload.duracionMinutos !== undefined) {
      content.duracionMinutos = payload.duracionMinutos;
    }

    if (payload.sinopsis !== undefined) {
      content.sinopsis = payload.sinopsis?.trim();
    }

    if (payload.esExclusivo !== undefined) {
      content.esExclusivo = payload.esExclusivo ? 1 : 0;
    }

    const savedContent = await this.contentRepository.save(content);

    const hydratedContent = await this.contentRepository.findOne({
      where: { id: savedContent.id },
      relations: { categoria: true, empleadoPublicador: true },
    });

    if (!hydratedContent) {
      throw new NotFoundException(
        'No fue posible reconstruir el contenido actualizado',
      );
    }

    return this.mapContent(hydratedContent);
  }

  /**
   * Lista generos disponibles del catalogo.
   * @returns Coleccion de generos ordenados por nombre.
   */
  async listGenres(): Promise<CatalogGenreView[]> {
    const genres = await this.genreRepository
      .createQueryBuilder('genero')
      .orderBy('genero.nombre', 'ASC')
      .getMany();

    return genres.map((genre) => this.mapGenre(genre));
  }

  /**
   * Consulta generos asignados a un contenido.
   * @param contentId - Identificador del contenido.
   * @returns Coleccion de generos asociados.
   */
  async getContentGenres(contentId: number): Promise<CatalogGenreView[]> {
    const contentGenres = await this.contentGenreRepository
      .createQueryBuilder('cg')
      .innerJoinAndSelect('cg.genero', 'genero')
      .where('cg.idContenido = :contentId', { contentId })
      .orderBy('genero.nombre', 'ASC')
      .getMany();

    return contentGenres.map((cg) => this.mapGenre(cg.genero));
  }

  /**
   * Consulta temporadas de un contenido (series y podcasts).
   * @param contentId - Identificador del contenido.
   * @returns Coleccion de temporadas ordenadas por numero.
   */
  async getContentSeasons(contentId: number): Promise<CatalogSeasonView[]> {
    const seasons = await this.seasonRepository
      .createQueryBuilder('temporada')
      .innerJoin('temporada.contenido', 'contenido')
      .where('contenido.id = :contentId', { contentId })
      .orderBy('temporada.numeroTemporada', 'ASC')
      .getMany();

    return seasons.map((season) => this.mapSeason(season));
  }

  /**
   * Consulta episodios de una temporada.
   * @param seasonId - Identificador de la temporada.
   * @returns Coleccion de episodios ordenados por numero.
   */
  async getSeasonEpisodes(seasonId: number): Promise<CatalogEpisodeView[]> {
    const episodes = await this.episodeRepository
      .createQueryBuilder('episodio')
      .innerJoin('episodio.temporada', 'temporada')
      .where('temporada.id = :seasonId', { seasonId })
      .orderBy('episodio.numeroEpisodio', 'ASC')
      .getMany();

    return episodes.map((episode) => this.mapEpisode(episode));
  }

  /**
   * Consulta contenidos relacionados a un contenido.
   * @param contentId - Identificador del contenido origen.
   * @returns Coleccion de relaciones con contenido destino.
   */
  async getRelatedContents(
    contentId: number,
  ): Promise<CatalogRelatedContentView[]> {
    const related = await this.relatedContentRepository
      .createQueryBuilder('relacion')
      .innerJoinAndSelect(
        'relacion.contenidoRelacionado',
        'contenidoRelacionado',
      )
      .innerJoinAndSelect('contenidoRelacionado.categoria', 'categoria')
      .where('relacion.contenidoOrigen.id = :contentId', { contentId })
      .orderBy('relacion.tipoRelacion', 'ASC')
      .getMany();

    return related.map((rel) => ({
      id: rel.id,
      tipoRelacion: rel.tipoRelacion,
      descripcion: rel.descripcion ?? null,
      contenidoRelacionado: this.mapContent(rel.contenidoRelacionado),
    }));
  }

  /**
   * Normaliza entidad de categoria para contrato de API.
   * @param category - Entidad de categoria.
   * @returns Vista de categoria.
   */
  private mapCategory(category: CategoryEntity): CatalogCategoryView {
    return {
      id: category.id,
      nombre: category.nombre,
      descripcion: category.descripcion ?? null,
    };
  }

  /**
   * Normaliza entidad de contenido para contrato de API.
   * @param content - Entidad de contenido.
   * @returns Vista de contenido.
   */
  private mapContent(content: ContentEntity): CatalogContentView {
    return {
      id: content.id,
      titulo: content.titulo,
      tipoContenido: content.tipoContenido,
      anioLanzamiento: content.anioLanzamiento ?? null,
      duracionMinutos: content.duracionMinutos ?? null,
      sinopsis: content.sinopsis ?? null,
      clasificacionEdad: content.clasificacionEdad,
      fechaAdicion: content.fechaAdicion,
      esExclusivo: content.esExclusivo === 1,
      empleadoPublicadorId: content.empleadoPublicador?.id ?? null,
      categoria: this.mapCategory(content.categoria),
    };
  }

  private mapGenre(genre: GenreEntity): CatalogGenreView {
    return {
      id: genre.id,
      nombre: genre.nombre,
      descripcion: genre.descripcion ?? null,
    };
  }

  private mapSeason(season: SeasonEntity): CatalogSeasonView {
    return {
      id: season.id,
      numeroTemporada: season.numeroTemporada,
      titulo: season.titulo ?? null,
      descripcion: season.descripcion ?? null,
      fechaEstreno: season.fechaEstreno
        ? season.fechaEstreno.toISOString().split('T')[0]
        : null,
    };
  }

  private mapEpisode(episode: EpisodeEntity): CatalogEpisodeView {
    return {
      id: episode.id,
      numeroEpisodio: episode.numeroEpisodio,
      titulo: episode.titulo,
      duracionMinutos: episode.duracionMinutos ?? null,
      sinopsis: episode.sinopsis ?? null,
      fechaEstreno: episode.fechaEstreno
        ? episode.fechaEstreno.toISOString().split('T')[0]
        : null,
    };
  }
}
