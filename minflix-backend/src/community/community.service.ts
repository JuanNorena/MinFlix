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
  FavoriteItemView,
  FavoriteStatusView,
} from './contracts/community-view.types';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoriteStatusQueryDto } from './dto/favorite-status-query.dto';
import { ListFavoritesQueryDto } from './dto/list-favorites-query.dto';
import { FavoriteEntity } from './entities';

/**
 * Servicio de comunidad para favoritos por perfil.
 */
@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
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
