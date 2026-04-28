import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileEntity, UserEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
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
import { ListRatingsQueryDto } from './dto/list-ratings-query.dto';
import { ModerateReportDto } from './dto/moderate-report.dto';
import { RatingStatusQueryDto } from './dto/rating-status-query.dto';
import { UpsertRatingDto } from './dto/upsert-rating.dto';
import { FavoriteEntity, RatingEntity } from './entities';
import { ReportEntity } from './entities/report.entity';

/**
 * Servicio de comunidad para funcionalidades sociales e interacción de usuarios.
 *
 * Este servicio implementa la lógica completa de interacción social en MinFlix,
 * gestionando favoritos, calificaciones y reportes de contenido, con validaciones
 * de restricciones de edad y control de acceso por perfil.
 *
 * @remarks
 * **Responsabilidades principales:**
 *
 * **1. Gestión de Favoritos:**
 * - Agregar contenido a favoritos validando ownership del perfil
 * - Verificar restricciones de edad (infantil no puede +16/+18)
 * - Operaciones idempotentes (no error si ya existe)
 * - Eliminar favoritos de forma segura
 * - Consultar lista de favoritos ordenada por fecha
 * - Verificar estado de favorito para un contenido específico
 *
 * **2. Gestión de Calificaciones:**
 * - Crear o actualizar calificación (upsert pattern)
 * - Validar regla de negocio: >50% de reproducción para calificar (trigger Oracle ORA-20041)
 * - Soportar puntaje 1-5 estrellas con reseña textual opcional
 * - Eliminar calificaciones propias
 * - Listar calificaciones por perfil
 * - Consultar estado y puntaje de calificación existente
 *
 * **3. Sistema de Reportes:**
 * - Crear reportes de contenido inapropiado por perfil
 * - Motivos: contenido ofensivo, error técnico, derechos de autor, otro
 * - Estados: ABIERTO → EN_REVISION → RESUELTO/DESCARTADO
 * - Listar reportes propios del perfil autenticado
 * - Bandeja de moderación para roles soporte/admin
 * - Actualizar estado y asignar moderador
 * - Validar resolución obligatoria al cerrar reporte
 * - Prevenir reapertura de reportes cerrados (trigger Oracle ORA-20064)
 *
 * **4. Validaciones y Seguridad:**
 * - Verificar ownership de perfil en cada operación
 * - Validar restricciones de edad para perfiles infantiles
 * - Control de acceso por rol para moderación (solo soporte/admin)
 * - Captura y traducción de errores Oracle ORA-20xxx
 *
 * **5. Captura de Errores Oracle:**
 * - ORA-20031: Perfil no puede agregar contenido a favoritos por edad
 * - ORA-20032: Perfil o contenido no existe para favorito
 * - ORA-20041: Requiere >50% reproducción para calificar
 * - ORA-20042: Perfil o contenido no existe para calificación
 * - ORA-20061: Perfil reportador no existe
 * - ORA-20062: Contenido reportado no existe
 * - ORA-20063: Solo soporte/admin pueden moderar
 * - ORA-20064: No se pueden reabrir reportes cerrados
 * - ORA-20065: Requiere moderador asignado para cerrar
 * - ORA-20066: Moderador asignado no existe
 *
 * @example
 * ```typescript
 * // Agregar contenido a favoritos
 * const favorito = await communityService.addFavorite(userId, {
 *   perfilId: 10,
 *   contenidoId: 250
 * });
 *
 * // Calificar contenido (solo si se ha visto >50%)
 * const calificacion = await communityService.upsertRating(userId, {
 *   perfilId: 10,
 *   contenidoId: 250,
 *   puntaje: 5,
 *   resena: '¡Excelente película! Me encantó la trama.'
 * });
 *
 * // Crear reporte de contenido
 * const reporte = await communityService.createReport(userId, {
 *   perfilId: 10,
 *   contenidoId: 300,
 *   motivo: 'CONTENIDO_OFENSIVO',
 *   detalle: 'Contiene lenguaje inapropiado no señalado en la clasificación'
 * });
 *
 * // Moderar reporte (solo soporte/admin)
 * await communityService.moderateReport(moderadorId, 'admin', reporteId, {
 *   estado: 'RESUELTO',
 *   resolucion: 'Se actualizó la clasificación del contenido a +16'
 * });
 * ```
 *
 * @see {@link FavoriteEntity} para la estructura de favoritos en Oracle
 * @see {@link RatingEntity} para la estructura de calificaciones en Oracle
 * @see {@link ReportEntity} para la estructura de reportes en Oracle
 * @see {@link CommunityController} para los endpoints REST expuestos
 */
@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
  ) {}

  /**
   * Agrega un contenido a favoritos para el perfil autenticado.
   * @param userId - Cuenta autenticada.
   * @param payload - Datos del favorito a crear.
   * @returns Favorito consolidado para respuesta de API.
   */
  async addFavorite(
    userId: number,
    payload: AddFavoriteDto,
  ): Promise<FavoriteItemView> {
    const profile = await this.ensureProfileOwnership(payload.perfilId, userId);
    const content = await this.contentRepository.findOne({
      where: { id: payload.contenidoId },
      relations: { categoria: true },
    });

    if (!content) {
      throw new NotFoundException('El contenido seleccionado no existe');
    }

    this.ensureContentAllowedForProfile(profile, content);

    const existingFavorite = await this.findFavoriteByProfileAndContent(
      payload.perfilId,
      payload.contenidoId,
    );

    if (existingFavorite) {
      return this.mapFavorite(existingFavorite);
    }

    let savedFavoriteId: number | null = null;

    try {
      const savedFavorite = await this.favoriteRepository.save(
        this.favoriteRepository.create({
          perfil: profile,
          contenido: content,
        }),
      );

      savedFavoriteId = savedFavorite.id;
    } catch (error) {
      if (this.isOracleBusinessRuleError(error, 'ORA-20031')) {
        throw new BadRequestException(
          'El perfil seleccionado no puede agregar este contenido a favoritos',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20032')) {
        throw new NotFoundException(
          'No existe el perfil o contenido asociado para registrar favorito',
        );
      }

      if (!this.isOracleUniqueConstraintError(error)) {
        throw error;
      }
    }

    const persistedFavorite =
      savedFavoriteId !== null
        ? await this.favoriteRepository.findOne({
            where: { id: savedFavoriteId },
            relations: { contenido: { categoria: true }, perfil: true },
          })
        : await this.findFavoriteByProfileAndContent(
            payload.perfilId,
            payload.contenidoId,
          );

    if (!persistedFavorite) {
      throw new NotFoundException('No fue posible registrar el favorito');
    }

    return this.mapFavorite(persistedFavorite);
  }

  /**
   * Elimina un favorito existente para el perfil autenticado.
   * @param userId - Cuenta autenticada.
   * @param perfilId - Perfil que elimina el favorito.
   * @param contenidoId - Contenido a remover.
   */
  async removeFavorite(
    userId: number,
    perfilId: number,
    contenidoId: number,
  ): Promise<void> {
    await this.ensureProfileOwnership(perfilId, userId);

    const favorite = await this.findFavoriteByProfileAndContent(
      perfilId,
      contenidoId,
    );

    if (!favorite) {
      return;
    }

    await this.favoriteRepository.delete({ id: favorite.id });
  }

  /**
   * Lista favoritos por perfil en orden descendente de adicion.
   * @param userId - Cuenta autenticada.
   * @param query - Parametros de consulta del listado.
   * @returns Coleccion de favoritos para el perfil.
   */
  async listFavorites(
    userId: number,
    query: ListFavoritesQueryDto,
  ): Promise<FavoriteItemView[]> {
    await this.ensureProfileOwnership(query.perfilId, userId);

    const favorites = await this.favoriteRepository
      .createQueryBuilder('favorito')
      .innerJoinAndSelect('favorito.perfil', 'perfil')
      .innerJoinAndSelect('favorito.contenido', 'contenido')
      .innerJoinAndSelect('contenido.categoria', 'categoria')
      .where('perfil.id = :perfilId', { perfilId: query.perfilId })
      .orderBy('favorito.fechaAdicion', 'DESC')
      .take(query.limit ?? 20)
      .getMany();

    return favorites.map((favorite) => this.mapFavorite(favorite));
  }

  /**
   * Consulta estado de favorito para un contenido puntual.
   * @param userId - Cuenta autenticada.
   * @param query - Datos de perfil y contenido.
   * @returns Indicador booleano de favorito.
   */
  async getFavoriteStatus(
    userId: number,
    query: FavoriteStatusQueryDto,
  ): Promise<FavoriteStatusView> {
    await this.ensureProfileOwnership(query.perfilId, userId);

    const favoriteCount = await this.favoriteRepository
      .createQueryBuilder('favorito')
      .innerJoin('favorito.perfil', 'perfil')
      .innerJoin('favorito.contenido', 'contenido')
      .where('perfil.id = :perfilId', { perfilId: query.perfilId })
      .andWhere('contenido.id = :contenidoId', {
        contenidoId: query.contenidoId,
      })
      .getCount();

    return {
      perfilId: query.perfilId,
      contenidoId: query.contenidoId,
      esFavorito: favoriteCount > 0,
    };
  }

  /**
   * Crea o actualiza calificacion para un contenido por perfil.
   * @param userId - Cuenta autenticada.
   * @param payload - Datos de calificacion recibidos.
   * @returns Calificacion consolidada para respuesta API.
   */
  async upsertRating(
    userId: number,
    payload: UpsertRatingDto,
  ): Promise<RatingItemView> {
    const profile = await this.ensureProfileOwnership(payload.perfilId, userId);
    const content = await this.contentRepository.findOne({
      where: { id: payload.contenidoId },
      relations: { categoria: true },
    });

    if (!content) {
      throw new NotFoundException('El contenido seleccionado no existe');
    }

    this.ensureContentAllowedForProfile(profile, content);

    const existingRating = await this.findRatingByProfileAndContent(
      payload.perfilId,
      payload.contenidoId,
    );

    const reviewText = payload.resena?.trim() || undefined;
    let persistedRatingId: number | null = null;

    try {
      if (existingRating) {
        existingRating.puntaje = payload.puntaje;
        existingRating.resena = reviewText;

        const updatedRating = await this.ratingRepository.save(existingRating);
        persistedRatingId = updatedRating.id;
      } else {
        const savedRating = await this.ratingRepository.save(
          this.ratingRepository.create({
            perfil: profile,
            contenido: content,
            puntaje: payload.puntaje,
            resena: reviewText,
          }),
        );

        persistedRatingId = savedRating.id;
      }
    } catch (error) {
      if (this.isOracleBusinessRuleError(error, 'ORA-20041')) {
        throw new BadRequestException(
          'Debes superar el 50% de reproduccion para calificar este contenido',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20042')) {
        throw new NotFoundException(
          'No existe perfil o contenido asociado para registrar calificacion',
        );
      }

      throw error;
    }

    const persistedRating =
      persistedRatingId !== null
        ? await this.ratingRepository.findOne({
            where: { id: persistedRatingId },
            relations: { perfil: true, contenido: { categoria: true } },
          })
        : await this.findRatingByProfileAndContent(
            payload.perfilId,
            payload.contenidoId,
          );

    if (!persistedRating) {
      throw new NotFoundException('No fue posible registrar la calificacion');
    }

    return this.mapRating(persistedRating);
  }

  /**
   * Elimina calificacion por contenido para el perfil autenticado.
   * @param userId - Cuenta autenticada.
   * @param perfilId - Perfil que elimina la calificacion.
   * @param contenidoId - Contenido asociado.
   */
  async removeRating(
    userId: number,
    perfilId: number,
    contenidoId: number,
  ): Promise<void> {
    await this.ensureProfileOwnership(perfilId, userId);

    const rating = await this.findRatingByProfileAndContent(
      perfilId,
      contenidoId,
    );
    if (!rating) {
      return;
    }

    await this.ratingRepository.delete({ id: rating.id });
  }

  /**
   * Lista calificaciones por perfil ordenadas por fecha descendente.
   * @param userId - Cuenta autenticada.
   * @param query - Parametros de consulta.
   * @returns Coleccion de calificaciones para el perfil.
   */
  async listRatings(
    userId: number,
    query: ListRatingsQueryDto,
  ): Promise<RatingItemView[]> {
    await this.ensureProfileOwnership(query.perfilId, userId);

    const ratings = await this.ratingRepository
      .createQueryBuilder('calificacion')
      .innerJoinAndSelect('calificacion.perfil', 'perfil')
      .innerJoinAndSelect('calificacion.contenido', 'contenido')
      .innerJoinAndSelect('contenido.categoria', 'categoria')
      .where('perfil.id = :perfilId', { perfilId: query.perfilId })
      .orderBy('calificacion.fechaCalificacion', 'DESC')
      .take(query.limit ?? 20)
      .getMany();

    return ratings.map((rating) => this.mapRating(rating));
  }

  /**
   * Consulta estado de calificacion para contenido puntual.
   * @param userId - Cuenta autenticada.
   * @param query - Perfil y contenido evaluados.
   * @returns Estado de calificacion para el contenido.
   */
  async getRatingStatus(
    userId: number,
    query: RatingStatusQueryDto,
  ): Promise<RatingStatusView> {
    await this.ensureProfileOwnership(query.perfilId, userId);

    const rating = await this.findRatingByProfileAndContent(
      query.perfilId,
      query.contenidoId,
    );

    if (!rating) {
      return {
        perfilId: query.perfilId,
        contenidoId: query.contenidoId,
        tieneCalificacion: false,
        puntaje: null,
        resena: null,
      };
    }

    return {
      perfilId: query.perfilId,
      contenidoId: query.contenidoId,
      tieneCalificacion: true,
      puntaje: rating.puntaje,
      resena: rating.resena ?? null,
    };
  }

  /**
   * Crea un reporte de contenido asociado a un perfil de la cuenta.
   * @param userId - Cuenta autenticada.
   * @param payload - Datos de reporte recibidos.
   * @returns Reporte persistido para respuesta de API.
   */
  async createReport(
    userId: number,
    payload: CreateReportDto,
  ): Promise<ReportItemView> {
    const profile = await this.ensureProfileOwnership(payload.perfilId, userId);
    const content = await this.contentRepository.findOne({
      where: { id: payload.contenidoId },
    });

    if (!content) {
      throw new NotFoundException('El contenido seleccionado no existe');
    }

    const detailText = payload.detalle?.trim() || undefined;
    let persistedReportId: number | null = null;

    try {
      const savedReport = await this.reportRepository.save(
        this.reportRepository.create({
          perfilReportador: profile,
          contenido: content,
          motivo: payload.motivo,
          detalle: detailText,
          estadoReporte: 'ABIERTO',
        }),
      );

      persistedReportId = savedReport.id;
    } catch (error) {
      if (this.isOracleBusinessRuleError(error, 'ORA-20061')) {
        throw new NotFoundException(
          'No existe el perfil reportador asociado al reporte',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20062')) {
        throw new NotFoundException(
          'No existe el contenido asociado al reporte',
        );
      }

      throw error;
    }

    if (persistedReportId === null) {
      throw new NotFoundException('No fue posible registrar el reporte');
    }

    const persistedReport = await this.findReportById(persistedReportId);

    if (!persistedReport) {
      throw new NotFoundException('No fue posible registrar el reporte');
    }

    return this.mapReport(persistedReport);
  }

  /**
   * Lista reportes de un perfil perteneciente a la cuenta autenticada.
   * @param userId - Cuenta autenticada.
   * @param query - Parametros de consulta para historial de reportes.
   * @returns Coleccion de reportes por perfil.
   */
  async listReportsByProfile(
    userId: number,
    query: ListReportsQueryDto,
  ): Promise<ReportItemView[]> {
    await this.ensureProfileOwnership(query.perfilId, userId);

    const reportsQuery = this.reportRepository
      .createQueryBuilder('reporte')
      .innerJoinAndSelect('reporte.perfilReportador', 'perfil')
      .innerJoinAndSelect('reporte.contenido', 'contenido')
      .leftJoinAndSelect('reporte.usuarioModerador', 'moderador')
      .where('perfil.id = :perfilId', { perfilId: query.perfilId });

    if (query.estado) {
      reportsQuery.andWhere('reporte.estadoReporte = :estado', {
        estado: query.estado,
      });
    }

    const reports: ReportEntity[] = await reportsQuery
      .orderBy('reporte.fechaActualizacion', 'DESC')
      .take(query.limit ?? 20)
      .getMany();

    return reports.map((report): ReportItemView => this.mapReport(report));
  }

  /**
   * Lista bandeja de reportes para moderacion por soporte/admin.
   * @param userId - Cuenta autenticada.
   * @param userRole - Rol del usuario autenticado.
   * @param query - Filtros de bandeja.
   * @returns Coleccion de reportes para moderacion.
   */
  async listModerationReports(
    userId: number,
    userRole: string,
    query: ListModerationReportsQueryDto,
  ): Promise<ReportItemView[]> {
    await this.ensureModeratorAccess(userId, userRole);

    const moderationQuery = this.reportRepository
      .createQueryBuilder('reporte')
      .innerJoinAndSelect('reporte.perfilReportador', 'perfil')
      .innerJoinAndSelect('reporte.contenido', 'contenido')
      .leftJoinAndSelect('reporte.usuarioModerador', 'moderador');

    if (query.estado) {
      moderationQuery.where('reporte.estadoReporte = :estado', {
        estado: query.estado,
      });
    } else {
      moderationQuery.where('reporte.estadoReporte IN (:...estados)', {
        estados: ['ABIERTO', 'EN_REVISION'],
      });
    }

    const reports: ReportEntity[] = await moderationQuery
      .orderBy('reporte.fechaActualizacion', 'DESC')
      .take(query.limit ?? 30)
      .getMany();

    return reports.map((report): ReportItemView => this.mapReport(report));
  }

  /**
   * Ejecuta moderacion de un reporte con control por rol.
   * @param userId - Cuenta autenticada.
   * @param userRole - Rol reportado por JWT.
   * @param reportId - Reporte objetivo de la accion.
   * @param payload - Estado y resolucion a aplicar.
   * @returns Reporte actualizado tras moderacion.
   */
  async moderateReport(
    userId: number,
    userRole: string,
    reportId: number,
    payload: ModerateReportDto,
  ): Promise<ReportItemView> {
    const moderator = await this.ensureModeratorAccess(userId, userRole);

    if (
      (payload.estado === 'RESUELTO' || payload.estado === 'DESCARTADO') &&
      !payload.resolucion?.trim()
    ) {
      throw new BadRequestException(
        'Para cerrar un reporte debes registrar una resolucion',
      );
    }

    const existingReport = await this.findReportById(reportId);

    if (!existingReport) {
      throw new NotFoundException('El reporte seleccionado no existe');
    }

    existingReport.estadoReporte = payload.estado;
    existingReport.resolucion = payload.resolucion?.trim() || undefined;
    existingReport.usuarioModerador = moderator;

    try {
      await this.reportRepository.save(existingReport);
    } catch (error) {
      if (this.isOracleBusinessRuleError(error, 'ORA-20063')) {
        throw new ForbiddenException(
          'Solo usuarios con rol soporte o admin pueden moderar reportes',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20064')) {
        throw new BadRequestException(
          'No se permite reabrir reportes cerrados',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20065')) {
        throw new BadRequestException(
          'Para cerrar un reporte se requiere moderador asignado',
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20066')) {
        throw new NotFoundException(
          'No existe el usuario moderador asociado al reporte',
        );
      }

      throw error;
    }

    const persistedReport = await this.findReportById(reportId);

    if (!persistedReport) {
      throw new NotFoundException('No fue posible actualizar el reporte');
    }

    return this.mapReport(persistedReport);
  }

  /**
   * Verifica ownership del perfil contra la cuenta autenticada.
   * @param profileId - Perfil evaluado.
   * @param userId - Cuenta autenticada.
   * @returns Perfil autorizado para operar.
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
   * Valida acceso de moderacion para roles soporte/admin.
   * @param userId - Cuenta autenticada.
   * @param userRole - Rol recibido en JWT.
   * @returns Usuario moderador validado.
   */
  private async ensureModeratorAccess(
    userId: number,
    userRole: string,
  ): Promise<UserEntity> {
    const normalizedRole = userRole.toLowerCase();

    if (normalizedRole !== 'soporte' && normalizedRole !== 'admin') {
      throw new ForbiddenException(
        'Solo usuarios con rol soporte o admin pueden moderar reportes',
      );
    }

    const moderator = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!moderator) {
      throw new NotFoundException('No existe la cuenta moderadora autenticada');
    }

    const persistedRole = moderator.rol.toLowerCase();
    if (persistedRole !== 'soporte' && persistedRole !== 'admin') {
      throw new ForbiddenException(
        'La cuenta autenticada no tiene permisos de moderacion',
      );
    }

    return moderator;
  }

  /**
   * Busca favorito por perfil y contenido para operaciones idempotentes.
   * @param perfilId - Perfil consultado.
   * @param contenidoId - Contenido consultado.
   * @returns Favorito encontrado o null.
   */
  private async findFavoriteByProfileAndContent(
    perfilId: number,
    contenidoId: number,
  ): Promise<FavoriteEntity | null> {
    return this.favoriteRepository
      .createQueryBuilder('favorito')
      .innerJoinAndSelect('favorito.perfil', 'perfil')
      .innerJoinAndSelect('favorito.contenido', 'contenido')
      .innerJoinAndSelect('contenido.categoria', 'categoria')
      .where('perfil.id = :perfilId', { perfilId })
      .andWhere('contenido.id = :contenidoId', { contenidoId })
      .getOne();
  }

  /**
   * Valida restriccion de clasificacion para perfiles infantiles.
   * @param profile - Perfil solicitante.
   * @param content - Contenido objetivo.
   */
  private ensureContentAllowedForProfile(
    profile: ProfileEntity,
    content: ContentEntity,
  ): void {
    const isChildProfile = profile.tipoPerfil.toLowerCase() === 'infantil';
    if (!isChildProfile) {
      return;
    }

    if (
      content.clasificacionEdad === '+16' ||
      content.clasificacionEdad === '+18'
    ) {
      throw new BadRequestException(
        'El perfil infantil no puede agregar este contenido a favoritos',
      );
    }
  }

  /**
   * Mapea entidad de favorito al contrato de API.
   * @param favorite - Entidad favorita hidratada.
   * @returns Vista de favorito para cliente.
   */
  private mapFavorite(favorite: FavoriteEntity): FavoriteItemView {
    return {
      idFavorito: favorite.id,
      perfilId: favorite.perfil.id,
      contenidoId: favorite.contenido.id,
      titulo: favorite.contenido.titulo,
      tipoContenido: favorite.contenido.tipoContenido,
      clasificacionEdad: favorite.contenido.clasificacionEdad,
      categoria: {
        id: favorite.contenido.categoria.id,
        nombre: favorite.contenido.categoria.nombre,
        descripcion: favorite.contenido.categoria.descripcion ?? null,
      },
      fechaAdicion: favorite.fechaAdicion,
    };
  }

  /**
   * Busca calificacion por perfil y contenido para upsert/status.
   * @param perfilId - Perfil consultado.
   * @param contenidoId - Contenido consultado.
   * @returns Calificacion encontrada o null.
   */
  private async findRatingByProfileAndContent(
    perfilId: number,
    contenidoId: number,
  ): Promise<RatingEntity | null> {
    return this.ratingRepository
      .createQueryBuilder('calificacion')
      .innerJoinAndSelect('calificacion.perfil', 'perfil')
      .innerJoinAndSelect('calificacion.contenido', 'contenido')
      .innerJoinAndSelect('contenido.categoria', 'categoria')
      .where('perfil.id = :perfilId', { perfilId })
      .andWhere('contenido.id = :contenidoId', { contenidoId })
      .getOne();
  }

  /**
   * Busca reporte por identificador con relaciones para respuesta API.
   * @param reportId - Identificador del reporte.
   * @returns Reporte hidratado o null.
   */
  private async findReportById(reportId: number): Promise<ReportEntity | null> {
    return this.reportRepository.findOne({
      where: { id: reportId },
      relations: {
        perfilReportador: true,
        contenido: true,
        usuarioModerador: true,
      },
    });
  }

  /**
   * Mapea entidad de calificacion al contrato de API.
   * @param rating - Entidad de calificacion hidratada.
   * @returns Vista de calificacion para cliente.
   */
  private mapRating(rating: RatingEntity): RatingItemView {
    return {
      idCalificacion: rating.id,
      perfilId: rating.perfil.id,
      contenidoId: rating.contenido.id,
      titulo: rating.contenido.titulo,
      tipoContenido: rating.contenido.tipoContenido,
      clasificacionEdad: rating.contenido.clasificacionEdad,
      categoria: {
        id: rating.contenido.categoria.id,
        nombre: rating.contenido.categoria.nombre,
        descripcion: rating.contenido.categoria.descripcion ?? null,
      },
      puntaje: rating.puntaje,
      resena: rating.resena ?? null,
      fechaCalificacion: rating.fechaCalificacion,
    };
  }

  /**
   * Mapea entidad de reporte al contrato de API.
   * @param report - Entidad de reporte hidratada.
   * @returns Vista de reporte para cliente/moderacion.
   */
  private mapReport(report: ReportEntity): ReportItemView {
    return {
      idReporte: report.id,
      perfilId: report.perfilReportador.id,
      nombrePerfil: report.perfilReportador.nombre,
      contenidoId: report.contenido.id,
      tituloContenido: report.contenido.titulo,
      motivo: report.motivo,
      detalle: report.detalle ?? null,
      estadoReporte: report.estadoReporte,
      moderadorId: report.usuarioModerador?.id ?? null,
      moderadorEmail: report.usuarioModerador?.email ?? null,
      resolucion: report.resolucion ?? null,
      fechaReporte: report.fechaReporte,
      fechaActualizacion: report.fechaActualizacion,
      fechaResolucion: report.fechaResolucion ?? null,
    };
  }

  /**
   * Detecta errores de constraint unica en Oracle.
   * @param error - Error capturado.
   * @returns True cuando corresponde a ORA-00001.
   */
  private isOracleUniqueConstraintError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return error.message.includes('ORA-00001');
  }

  /**
   * Detecta errores de reglas Oracle por codigo especifico.
   * @param error - Error capturado.
   * @param oracleCode - Codigo Oracle esperado.
   * @returns True cuando hay coincidencia del codigo Oracle.
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
