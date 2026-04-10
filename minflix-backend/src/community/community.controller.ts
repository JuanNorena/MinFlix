import {
  Body,
  Controller,
  Delete,
  Get,
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
} from './contracts/community-view.types';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoriteStatusQueryDto } from './dto/favorite-status-query.dto';
import { ListFavoritesQueryDto } from './dto/list-favorites-query.dto';
import { RemoveFavoriteQueryDto } from './dto/remove-favorite-query.dto';
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
}
