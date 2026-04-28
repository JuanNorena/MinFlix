import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateContentDto } from './dto/create-content.dto';
import { ListContentQueryDto } from './dto/list-content-query.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CatalogCategoryView,
  CatalogContentView,
} from './contracts/catalog-view.types';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Controlador REST para la gestión del catálogo de contenidos multimedia.
 *
 * Este controlador expone los endpoints para administrar el catálogo completo
 * de MinFlix, incluyendo contenidos (películas, series, documentales, música,
 * podcasts) y sus categorías de clasificación.
 *
 * @remarks
 * **Endpoints públicos (sin autenticación):**
 * - `GET /categories` - Listar todas las categorías
 * - `GET /contents` - Listar contenidos con filtros opcionales
 * - `GET /contents/:id` - Consultar detalle de un contenido específico
 *
 * **Endpoints privados (requieren JWT + rol admin/contenido):**
 * - `POST /categories` - Crear nueva categoría
 * - `POST /contents` - Crear nuevo contenido
 * - `PATCH /contents/:id` - Actualizar contenido existente
 *
 * **Control de acceso:**
 * - Las operaciones de escritura (POST, PATCH) requieren rol `admin` o `contenido`
 * - Las operaciones de lectura (GET) son públicas para todos los usuarios
 *
 * **Filtros de búsqueda disponibles:**
 * - `search`: Buscar por texto en título (case-insensitive)
 * - `tipoContenido`: Filtrar por PELICULA, SERIE, DOCUMENTAL, MUSICA, PODCAST
 * - `clasificacionEdad`: Filtrar por Todos, +7, +13, +16, +18
 * - `categoriaId`: Filtrar por categoría específica
 * - `exclusivo`: Filtrar contenidos exclusivos de MinFlix (true/false)
 * - `limit`: Limitar número de resultados (por defecto 24)
 *
 * @example
 * ```typescript
 * // Listar contenidos con filtros
 * GET /api/v1/catalog/contents?search=star&tipoContenido=PELICULA&limit=10
 *
 * // Crear nuevo contenido (requiere autenticación y rol admin/contenido)
 * POST /api/v1/catalog/contents
 * Authorization: Bearer <token>
 * {
 *   "titulo": "Inception",
 *   "tipoContenido": "PELICULA",
 *   "clasificacionEdad": "+13",
 *   "categoriaId": 3,
 *   "anioLanzamiento": 2010,
 *   "duracionMinutos": 148,
 *   "sinopsis": "Un ladrón que roba secretos...",
 *   "esExclusivo": true
 * }
 * ```
 *
 * @see {@link CatalogService} para la implementación de la lógica de negocio
 */
@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  /**
   * Constructor del controlador de catálogo.
   *
   * @param catalogService - Servicio inyectado con la lógica de negocio del catálogo
   */
  constructor(private readonly catalogService: CatalogService) {}

  /**
   * Lista categorias disponibles de catalogo.
   * @returns Coleccion de categorias ordenada.
   */
  @ApiOperation({ summary: 'Listar categorias de catalogo' })
  @Get('categories')
  listCategories(): Promise<CatalogCategoryView[]> {
    return this.catalogService.listCategories();
  }

  /**
   * Crea una categoria nueva en el catalogo.
   * @param req - Request autenticado con rol de usuario.
   * @param payload - Datos de creacion de categoria.
   * @returns Categoria creada.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear categoria de catalogo (admin/contenido)' })
  @UseGuards(JwtAuthGuard)
  @Post('categories')
  createCategory(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateCategoryDto,
  ): Promise<CatalogCategoryView> {
    this.assertCatalogEditorRole(req.user.role);
    return this.catalogService.createCategory(payload);
  }

  /**
   * Lista contenidos del catalogo con filtros opcionales.
   * @param query - Filtros de consulta del catalogo.
   * @returns Coleccion filtrada de contenidos.
   */
  @ApiOperation({ summary: 'Listar contenidos del catalogo con filtros' })
  @Get('contents')
  listContents(
    @Query() query: ListContentQueryDto,
  ): Promise<CatalogContentView[]> {
    return this.catalogService.listContents(query);
  }

  /**
   * Consulta detalle de un contenido puntual.
   * @param contentId - Identificador del contenido.
   * @returns Contenido detallado.
   */
  @ApiOperation({ summary: 'Consultar detalle de contenido por id' })
  @Get('contents/:contentId')
  getContentById(
    @Param('contentId', ParseIntPipe) contentId: number,
  ): Promise<CatalogContentView> {
    return this.catalogService.getContentById(contentId);
  }

  /**
   * Crea un contenido nuevo en el catalogo.
   * @param req - Request autenticado con rol de usuario.
   * @param payload - Datos del contenido.
   * @returns Contenido creado.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear contenido de catalogo (admin/contenido)' })
  @UseGuards(JwtAuthGuard)
  @Post('contents')
  createContent(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateContentDto,
  ): Promise<CatalogContentView> {
    this.assertCatalogEditorRole(req.user.role);
    return this.catalogService.createContent(payload, req.user.userId);
  }

  /**
   * Actualiza contenido existente del catalogo.
   * @param req - Request autenticado con rol de usuario.
   * @param contentId - Identificador del contenido.
   * @param payload - Datos de actualizacion parcial.
   * @returns Contenido actualizado.
   */
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Actualizar contenido de catalogo de forma parcial (admin/contenido)',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('contents/:contentId')
  updateContent(
    @Req() req: AuthenticatedRequest,
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() payload: UpdateContentDto,
  ): Promise<CatalogContentView> {
    this.assertCatalogEditorRole(req.user.role);
    return this.catalogService.updateContent(contentId, payload);
  }

  /**
   * Valida que el usuario autenticado pueda editar catalogo.
   * @param role - Rol del usuario autenticado.
   */
  private assertCatalogEditorRole(role: string): void {
    if (role !== 'admin' && role !== 'contenido') {
      throw new ForbiddenException(
        'No tienes permisos para modificar el catalogo de contenidos',
      );
    }
  }
}
