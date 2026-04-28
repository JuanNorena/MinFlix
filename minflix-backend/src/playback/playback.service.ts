import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
import {
  ContinueWatchingView,
  PlaybackHistoryItemView,
  PlaybackEventView,
} from './contracts/playback-view.types';
import { ListContinueWatchingQueryDto } from './dto/list-continue-watching-query.dto';
import { ListPlaybackHistoryQueryDto } from './dto/list-playback-history-query.dto';
import { ReportPlaybackProgressDto } from './dto/report-playback-progress.dto';
import { StartPlaybackDto } from './dto/start-playback.dto';
import { ContinueWatchingEntity, PlaybackEntity } from './entities';

/**
 * Servicio de tracking de reproducciones y gestión de continuidad de visualización.
 *
 * Este servicio implementa la lógica completa de seguimiento de reproducciones
 * en MinFlix, permitiendo registrar eventos de inicio, progreso y finalización,
 * así como gestionar la funcionalidad de "Continuar viendo" y el historial.
 *
 * @remarks
 * **Responsabilidades principales:**
 *
 * 1. **Registro de Eventos de Reproducción:**
 *    - Iniciar reproducción (progreso en 0%)
 *    - Reportar progreso durante la reproducción
 *    - Registrar finalización (progreso 100%)
 *    - Validar ownership del perfil por la cuenta autenticada
 *
 * 2. **Validaciones de Negocio:**
 *    - Verificar que el perfil pertenezca al usuario autenticado
 *    - Validar restricciones de edad (perfiles infantiles vs contenido +16/+18)
 *    - Asegurar que la cuenta esté activa para reproducir
 *    - Validar que el progreso no supere la duración total
 *
 * 3. **Continuar Viendo:**
 *    - Consultar vista materializada de Oracle con contenidos en progreso
 *    - Ordenar por fecha del último evento (más reciente primero)
 *    - Excluir contenidos completados al 100%
 *
 * 4. **Historial de Reproducciones:**
 *    - Listar todos los eventos de reproducción de un perfil
 *    - Filtrar opcionalmente por estado (EN_PROGRESO, COMPLETADO, PAUSADO)
 *    - Incluir información completa del contenido reproducido
 *
 * 5. **Captura de Errores Oracle:**
 *    - Traducir códigos ORA-20xxx de triggers PL/SQL a excepciones HTTP
 *    - ORA-20021: Cuenta inactiva no puede reproducir
 *    - ORA-20022: Restricción de edad no cumplida
 *    - ORA-20023: Progreso supera duración total
 *    - ORA-20024: Perfil o contenido no existe
 *
 * @example
 * ```typescript
 * // Iniciar reproducción de una película
 * const evento = await playbackService.startPlayback(userId, {
 *   perfilId: 5,
 *   contenidoId: 120,
 *   duracionTotalSegundos: 7200, // 2 horas
 *   ultimoDispositivo: 'Smart TV Samsung'
 * });
 *
 * // Reportar progreso durante la reproducción
 * await playbackService.reportProgress(userId, {
 *   perfilId: 5,
 *   contenidoId: 120,
 *   progresoSegundos: 3600, // 1 hora = 50%
 *   duracionTotalSegundos: 7200,
 *   estadoReproduccion: 'EN_PROGRESO'
 * });
 *
 * // Listar contenidos para continuar viendo
 * const continuar = await playbackService.listContinueWatching(userId, {
 *   perfilId: 5,
 *   limit: 12
 * });
 * ```
 *
 * @see {@link PlaybackEntity} para la estructura de eventos en Oracle
 * @see {@link ContinueWatchingEntity} para la vista materializada
 * @see {@link PlaybackController} para los endpoints REST expuestos
 */
@Injectable()
export class PlaybackService {
  constructor(
    @InjectRepository(PlaybackEntity)
    private readonly playbackRepository: Repository<PlaybackEntity>,
    @InjectRepository(ContinueWatchingEntity)
    private readonly continueWatchingRepository: Repository<ContinueWatchingEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
  ) {}

  /**
   * Registra evento de inicio de reproduccion.
   * @param userId - Cuenta autenticada dueña del perfil.
   * @param payload - Datos de inicio de reproduccion.
   * @returns Evento persistido con campos calculados.
   */
  async startPlayback(
    userId: number,
    payload: StartPlaybackDto,
  ): Promise<PlaybackEventView> {
    return this.registerPlaybackEvent(userId, {
      perfilId: payload.perfilId,
      contenidoId: payload.contenidoId,
      progresoSegundos: 0,
      duracionTotalSegundos: payload.duracionTotalSegundos,
      ultimoDispositivo: payload.ultimoDispositivo,
      estadoReproduccion: 'EN_PROGRESO',
    });
  }

  /**
   * Registra evento de progreso o pausa durante reproduccion.
   * @param userId - Cuenta autenticada dueña del perfil.
   * @param payload - Datos del progreso reportado.
   * @returns Evento persistido con porcentaje recalculado por Oracle.
   */
  async reportProgress(
    userId: number,
    payload: ReportPlaybackProgressDto,
  ): Promise<PlaybackEventView> {
    return this.registerPlaybackEvent(userId, {
      perfilId: payload.perfilId,
      contenidoId: payload.contenidoId,
      progresoSegundos: payload.progresoSegundos,
      duracionTotalSegundos: payload.duracionTotalSegundos,
      ultimoDispositivo: payload.ultimoDispositivo,
      estadoReproduccion: payload.estadoReproduccion ?? 'EN_PROGRESO',
    });
  }

  /**
   * Lista la fila de continuar viendo para un perfil autenticado.
   * @param userId - Cuenta autenticada dueña del perfil.
   * @param query - Parametros de consulta.
   * @returns Coleccion ordenada por ultimo evento.
   */
  async listContinueWatching(
    userId: number,
    query: ListContinueWatchingQueryDto,
  ): Promise<ContinueWatchingView[]> {
    await this.ensureProfileOwnership(query.perfilId, userId);

    const continueWatchingRows = await this.continueWatchingRepository
      .createQueryBuilder('continuar')
      .where('continuar.perfilId = :perfilId', {
        perfilId: query.perfilId,
      })
      .orderBy('continuar.fechaUltimoEvento', 'DESC')
      .take(query.limit ?? 12)
      .getMany();

    return continueWatchingRows.map((row) => this.mapContinueWatching(row));
  }

  /**
   * Lista historial de reproduccion para un perfil autenticado.
   * @param userId - Cuenta autenticada dueña del perfil.
   * @param query - Parametros de consulta del historial.
   * @returns Historial de eventos ordenado por ultimo evento.
   */
  async listPlaybackHistory(
    userId: number,
    query: ListPlaybackHistoryQueryDto,
  ): Promise<PlaybackHistoryItemView[]> {
    await this.ensureProfileOwnership(query.perfilId, userId);

    const historyQueryBuilder = this.playbackRepository
      .createQueryBuilder('reproduccion')
      .innerJoinAndSelect('reproduccion.perfil', 'perfil')
      .innerJoinAndSelect('reproduccion.contenido', 'contenido')
      .where('perfil.id = :perfilId', {
        perfilId: query.perfilId,
      })
      .orderBy('reproduccion.fechaUltimoEvento', 'DESC')
      .take(query.limit ?? 20);

    if (query.estadoReproduccion) {
      historyQueryBuilder.andWhere(
        'reproduccion.estadoReproduccion = :estadoReproduccion',
        {
          estadoReproduccion: query.estadoReproduccion,
        },
      );
    }

    const historyRows = await historyQueryBuilder.getMany();

    return historyRows.map((row) => this.mapPlaybackHistoryItem(row));
  }

  /**
   * Valida ownership y registra un evento de reproduccion en Oracle.
   * @param userId - Cuenta autenticada dueña del perfil.
   * @param payload - Datos normalizados del evento.
   * @returns Evento recien creado.
   */
  private async registerPlaybackEvent(
    userId: number,
    payload: {
      perfilId: number;
      contenidoId: number;
      progresoSegundos: number;
      duracionTotalSegundos?: number;
      ultimoDispositivo?: string;
      estadoReproduccion: string;
    },
  ): Promise<PlaybackEventView> {
    const profile = await this.ensureProfileOwnership(payload.perfilId, userId);
    const content = await this.contentRepository.findOne({
      where: { id: payload.contenidoId },
    });

    if (!content) {
      throw new NotFoundException('El contenido seleccionado no existe');
    }

    try {
      const savedPlaybackEvent = await this.playbackRepository.save(
        this.playbackRepository.create({
          perfil: profile,
          contenido: content,
          progresoSegundos: payload.progresoSegundos,
          duracionTotalSegundos: payload.duracionTotalSegundos,
          ultimoDispositivo: payload.ultimoDispositivo,
          estadoReproduccion: payload.estadoReproduccion,
        }),
      );

      const hydratedPlaybackEvent = await this.playbackRepository.findOne({
        where: { id: savedPlaybackEvent.id },
        relations: { perfil: true, contenido: true },
      });

      if (!hydratedPlaybackEvent) {
        throw new NotFoundException(
          'No fue posible reconstruir el evento de reproduccion creado',
        );
      }

      return this.mapPlaybackEvent(hydratedPlaybackEvent);
    } catch (error) {
      if (this.isOracleBusinessRuleError(error, 'ORA-20021')) {
        throw new BadRequestException(
          'La cuenta debe estar activa para registrar reproducciones',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20022')) {
        throw new BadRequestException(
          'El perfil seleccionado no puede reproducir este contenido',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20023')) {
        throw new BadRequestException(
          'El progreso no puede superar la duracion total del contenido',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20024')) {
        throw new NotFoundException(
          'No existe el perfil o contenido asociado para registrar reproduccion',
        );
      }

      throw error;
    }
  }

  /**
   * Verifica que el perfil exista y pertenezca a la cuenta autenticada.
   * @param profileId - Identificador del perfil a validar.
   * @param userId - Cuenta autenticada.
   * @returns Perfil encontrado y autorizado.
   */
  private async ensureProfileOwnership(
    profileId: number,
    userId: number,
  ): Promise<ProfileEntity> {
    const profile = await this.profileRepository
      .createQueryBuilder('perfil')
      .innerJoinAndSelect('perfil.usuario', 'usuario')
      .where('perfil.id = :profileId', { profileId })
      .andWhere('usuario.id = :userId', { userId })
      .getOne();

    if (!profile) {
      throw new ForbiddenException(
        'El perfil seleccionado no pertenece a la cuenta autenticada',
      );
    }

    return profile;
  }

  /**
   * Mapea entidad de reproduccion a contrato de salida.
   * @param playbackEvent - Entidad de reproduccion.
   * @returns Vista normalizada para la API.
   */
  private mapPlaybackEvent(playbackEvent: PlaybackEntity): PlaybackEventView {
    return {
      idReproduccion: playbackEvent.id,
      perfilId: playbackEvent.perfil.id,
      contenidoId: playbackEvent.contenido.id,
      progresoSegundos: playbackEvent.progresoSegundos,
      duracionTotalSegundos: playbackEvent.duracionTotalSegundos ?? null,
      porcentajeAvance: Number(playbackEvent.porcentajeAvance),
      ultimoDispositivo: playbackEvent.ultimoDispositivo ?? null,
      estadoReproduccion: playbackEvent.estadoReproduccion,
      fechaInicio: playbackEvent.fechaInicio,
      fechaUltimoEvento: playbackEvent.fechaUltimoEvento,
      fechaFin: playbackEvent.fechaFin ?? null,
    };
  }

  /**
   * Mapea fila de vista continuar viendo a contrato de salida.
   * @param continueWatching - Fila proveniente de la vista Oracle.
   * @returns Vista normalizada para la API.
   */
  private mapContinueWatching(
    continueWatching: ContinueWatchingEntity,
  ): ContinueWatchingView {
    return {
      idReproduccion: continueWatching.idReproduccion,
      perfilId: continueWatching.perfilId,
      contenidoId: continueWatching.contenidoId,
      titulo: continueWatching.titulo,
      clasificacionEdad: continueWatching.clasificacionEdad,
      tipoContenido: continueWatching.tipoContenido,
      progresoSegundos: continueWatching.progresoSegundos,
      duracionTotalSegundos: continueWatching.duracionTotalSegundos ?? null,
      porcentajeAvance: Number(continueWatching.porcentajeAvance),
      ultimoDispositivo: continueWatching.ultimoDispositivo ?? null,
      estadoReproduccion: continueWatching.estadoReproduccion,
      fechaUltimoEvento: continueWatching.fechaUltimoEvento,
    };
  }

  /**
   * Mapea entidad de reproduccion a contrato de historial.
   * @param playbackEvent - Entidad de reproduccion hidratada.
   * @returns Vista de historial de reproduccion.
   */
  private mapPlaybackHistoryItem(
    playbackEvent: PlaybackEntity,
  ): PlaybackHistoryItemView {
    return {
      idReproduccion: playbackEvent.id,
      perfilId: playbackEvent.perfil.id,
      contenidoId: playbackEvent.contenido.id,
      titulo: playbackEvent.contenido.titulo,
      tipoContenido: playbackEvent.contenido.tipoContenido,
      clasificacionEdad: playbackEvent.contenido.clasificacionEdad,
      progresoSegundos: playbackEvent.progresoSegundos,
      duracionTotalSegundos: playbackEvent.duracionTotalSegundos ?? null,
      porcentajeAvance: Number(playbackEvent.porcentajeAvance),
      ultimoDispositivo: playbackEvent.ultimoDispositivo ?? null,
      estadoReproduccion: playbackEvent.estadoReproduccion,
      fechaInicio: playbackEvent.fechaInicio,
      fechaUltimoEvento: playbackEvent.fechaUltimoEvento,
      fechaFin: playbackEvent.fechaFin ?? null,
    };
  }

  /**
   * Detecta si el error corresponde a una regla Oracle especifica.
   * @param error - Error capturado.
   * @param oracleCode - Codigo Oracle esperado (por ejemplo ORA-20021).
   * @returns True cuando hay coincidencia.
   */
  private isOracleBusinessRuleError(
    error: unknown,
    oracleCode: string,
  ): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return error.message.includes(oracleCode);
  }
}
