import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ContinueWatchingView,
  PlaybackHistoryItemView,
  PlaybackEventView,
} from './contracts/playback-view.types';
import { ListContinueWatchingQueryDto } from './dto/list-continue-watching-query.dto';
import { ListPlaybackHistoryQueryDto } from './dto/list-playback-history-query.dto';
import { ReportPlaybackProgressDto } from './dto/report-playback-progress.dto';
import { StartPlaybackDto } from './dto/start-playback.dto';
import { PlaybackService } from './playback.service';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Controlador de reproducciones para tracking y continuidad.
 */
@ApiTags('playback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playback')
export class PlaybackController {
  constructor(private readonly playbackService: PlaybackService) {}

  /**
   * Registra inicio de reproduccion de un contenido.
   * @param req - Request autenticado.
   * @param payload - Datos de inicio de reproduccion.
   * @returns Evento de reproduccion creado.
   */
  @ApiOperation({ summary: 'Iniciar reproduccion para perfil activo' })
  @Post('start')
  startPlayback(
    @Req() req: AuthenticatedRequest,
    @Body() payload: StartPlaybackDto,
  ): Promise<PlaybackEventView> {
    return this.playbackService.startPlayback(req.user.userId, payload);
  }

  /**
   * Registra avance, pausa o finalizacion de reproduccion.
   * @param req - Request autenticado.
   * @param payload - Datos del evento de avance.
   * @returns Evento de reproduccion creado.
   */
  @ApiOperation({ summary: 'Reportar progreso de reproduccion' })
  @Post('progress')
  reportProgress(
    @Req() req: AuthenticatedRequest,
    @Body() payload: ReportPlaybackProgressDto,
  ): Promise<PlaybackEventView> {
    return this.playbackService.reportProgress(req.user.userId, payload);
  }

  /**
   * Lista contenidos en continuar viendo para un perfil.
   * @param req - Request autenticado.
   * @param query - Parametros de consulta por perfil.
   * @returns Coleccion de contenidos para reanudar.
   */
  @ApiOperation({ summary: 'Listar fila de continuar viendo por perfil' })
  @Get('continue-watching')
  listContinueWatching(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListContinueWatchingQueryDto,
  ): Promise<ContinueWatchingView[]> {
    return this.playbackService.listContinueWatching(req.user.userId, query);
  }

  /**
   * Lista historial de reproduccion por perfil.
   * @param req - Request autenticado.
   * @param query - Parametros de historial por perfil.
   * @returns Historial ordenado por fecha de ultimo evento.
   */
  @ApiOperation({ summary: 'Listar historial de reproduccion por perfil' })
  @Get('history')
  listPlaybackHistory(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListPlaybackHistoryQueryDto,
  ): Promise<PlaybackHistoryItemView[]> {
    return this.playbackService.listPlaybackHistory(req.user.userId, query);
  }
}
