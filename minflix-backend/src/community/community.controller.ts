import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  FavoriteItemView,
  FavoriteStatusView,
  ReportItemView,
  RatingItemView,
  RatingStatusView,
} from './contracts/community-view.types';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { FavoriteStatusQueryDto } from './dto/favorite-status-query.dto';
import { ListModerationReportsQueryDto } from './dto/list-moderation-reports-query.dto';
import { ListFavoritesQueryDto } from './dto/list-favorites-query.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { RemoveFavoriteQueryDto } from './dto/remove-favorite-query.dto';
import { ListRatingsQueryDto } from './dto/list-ratings-query.dto';
import { ModerateReportDto } from './dto/moderate-report.dto';
import { RatingStatusQueryDto } from './dto/rating-status-query.dto';
import { RemoveRatingQueryDto } from './dto/remove-rating-query.dto';
import { UpsertRatingDto } from './dto/upsert-rating.dto';
import { CommunityService } from './community.service';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Controlador de comunidad para favoritos por perfil.
 */
@ApiTags('community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /**
   * Agrega un contenido a favoritos.
   * @param req - Request autenticado.
   * @param payload - Datos del favorito.
   * @returns Favorito registrado.
   */
  @ApiOperation({ summary: 'Agregar contenido a favoritos por perfil' })
  @Post('favorites')
  addFavorite(
    @Req() req: AuthenticatedRequest,
    @Body() payload: AddFavoriteDto,
  ): Promise<FavoriteItemView> {
    return this.communityService.addFavorite(req.user.userId, payload);
  }

  /**
   * Elimina un favorito para el perfil autenticado.
   * @param req - Request autenticado.
   * @param contenidoId - Contenido a remover.
   * @param query - Perfil que realiza la operacion.
   */
  @ApiOperation({ summary: 'Eliminar contenido de favoritos por perfil' })
  @Delete('favorites/:contenidoId')
  removeFavorite(
    @Req() req: AuthenticatedRequest,
    @Param('contenidoId', ParseIntPipe) contenidoId: number,
    @Query() query: RemoveFavoriteQueryDto,
  ): Promise<void> {
    return this.communityService.removeFavorite(
      req.user.userId,
      query.perfilId,
      contenidoId,
    );
  }

  /**
   * Lista favoritos por perfil.
   * @param req - Request autenticado.
   * @param query - Parametros de consulta.
   * @returns Coleccion de favoritos.
   */
  @ApiOperation({ summary: 'Listar favoritos por perfil' })
  @Get('favorites')
  listFavorites(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListFavoritesQueryDto,
  ): Promise<FavoriteItemView[]> {
    return this.communityService.listFavorites(req.user.userId, query);
  }

  /**
   * Consulta si un contenido ya fue marcado como favorito.
   * @param req - Request autenticado.
   * @param query - Parametros de estado de favorito.
   * @returns Estado booleano de favorito.
   */
  @ApiOperation({ summary: 'Consultar estado de favorito por contenido' })
  @Get('favorites/status')
  getFavoriteStatus(
    @Req() req: AuthenticatedRequest,
    @Query() query: FavoriteStatusQueryDto,
  ): Promise<FavoriteStatusView> {
    return this.communityService.getFavoriteStatus(req.user.userId, query);
  }

  /**
   * Crea o actualiza calificacion para un contenido.
   * @param req - Request autenticado.
   * @param payload - Datos de la calificacion.
   * @returns Calificacion consolidada.
   */
  @ApiOperation({ summary: 'Crear o actualizar calificacion por perfil' })
  @Post('ratings')
  upsertRating(
    @Req() req: AuthenticatedRequest,
    @Body() payload: UpsertRatingDto,
  ): Promise<RatingItemView> {
    return this.communityService.upsertRating(req.user.userId, payload);
  }

  /**
   * Elimina calificacion por contenido para el perfil autenticado.
   * @param req - Request autenticado.
   * @param contenidoId - Contenido a descalificar.
   * @param query - Perfil que ejecuta la operacion.
   */
  @ApiOperation({ summary: 'Eliminar calificacion por perfil y contenido' })
  @Delete('ratings/:contenidoId')
  removeRating(
    @Req() req: AuthenticatedRequest,
    @Param('contenidoId', ParseIntPipe) contenidoId: number,
    @Query() query: RemoveRatingQueryDto,
  ): Promise<void> {
    return this.communityService.removeRating(
      req.user.userId,
      query.perfilId,
      contenidoId,
    );
  }

  /**
   * Lista calificaciones por perfil.
   * @param req - Request autenticado.
   * @param query - Parametros del listado.
   * @returns Coleccion de calificaciones.
   */
  @ApiOperation({ summary: 'Listar calificaciones por perfil' })
  @Get('ratings')
  listRatings(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListRatingsQueryDto,
  ): Promise<RatingItemView[]> {
    return this.communityService.listRatings(req.user.userId, query);
  }

  /**
   * Consulta estado de calificacion para un contenido.
   * @param req - Request autenticado.
   * @param query - Parametros de estado por contenido.
   * @returns Estado de calificacion (si existe o no).
   */
  @ApiOperation({ summary: 'Consultar estado de calificacion por contenido' })
  @Get('ratings/status')
  getRatingStatus(
    @Req() req: AuthenticatedRequest,
    @Query() query: RatingStatusQueryDto,
  ): Promise<RatingStatusView> {
    return this.communityService.getRatingStatus(req.user.userId, query);
  }

  /**
   * Registra un reporte de contenido por perfil.
   * @param req - Request autenticado.
   * @param payload - Datos del reporte.
   * @returns Reporte persistido.
   */
  @ApiOperation({ summary: 'Reportar contenido por perfil' })
  @Post('reports')
  createReport(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateReportDto,
  ): Promise<ReportItemView> {
    return this.communityService.createReport(req.user.userId, payload);
  }

  /**
   * Lista reportes creados por un perfil de la cuenta autenticada.
   * @param req - Request autenticado.
   * @param query - Parametros de filtro para reportes propios.
   * @returns Coleccion de reportes por perfil.
   */
  @ApiOperation({ summary: 'Listar reportes por perfil' })
  @Get('reports')
  listReportsByProfile(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListReportsQueryDto,
  ): Promise<ReportItemView[]> {
    return this.communityService.listReportsByProfile(req.user.userId, query);
  }

  /**
   * Lista bandeja de reportes para moderacion por rol soporte/admin.
   * @param req - Request autenticado.
   * @param query - Parametros de filtro para bandeja.
   * @returns Coleccion de reportes para moderar.
   */
  @ApiOperation({ summary: 'Listar bandeja de moderacion de reportes' })
  @Get('reports/moderation')
  listModerationReports(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListModerationReportsQueryDto,
  ): Promise<ReportItemView[]> {
    return this.communityService.listModerationReports(
      req.user.userId,
      req.user.role,
      query,
    );
  }

  /**
   * Aplica accion de moderacion sobre un reporte especifico.
   * @param req - Request autenticado.
   * @param reporteId - Reporte objetivo.
   * @param payload - Estado y resolucion de moderacion.
   * @returns Reporte actualizado tras moderacion.
   */
  @ApiOperation({ summary: 'Moderar estado de reporte por soporte/admin' })
  @Patch('reports/:reporteId/moderation')
  moderateReport(
    @Req() req: AuthenticatedRequest,
    @Param('reporteId', ParseIntPipe) reporteId: number,
    @Body() payload: ModerateReportDto,
  ): Promise<ReportItemView> {
    return this.communityService.moderateReport(
      req.user.userId,
      req.user.role,
      reporteId,
      payload,
    );
  }
}
