import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { CategoryEntity, ContentEntity } from './entities';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { ListContentQueryDto } from './dto/list-content-query.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import {
  CatalogCategoryView,
  CatalogContentView,
} from './contracts/catalog-view.types';

/**
 * Servicio de catalogo base para la iteracion inicial de contenidos.
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
}
