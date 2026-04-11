import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
import { CommunityService } from './community.service';
import { FavoriteEntity, RatingEntity } from './entities';

describe('CommunityService', () => {
  let service: CommunityService;
  let favoriteRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let ratingRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let profileRepository: {
    createQueryBuilder: jest.Mock;
  };
  let contentRepository: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    favoriteRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    ratingRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    profileRepository = {
      createQueryBuilder: jest.fn(),
    };

    contentRepository = {
      findOne: jest.fn(),
    };

    service = new CommunityService(
      favoriteRepository as unknown as Repository<FavoriteEntity>,
      ratingRepository as unknown as Repository<RatingEntity>,
      profileRepository as unknown as Repository<ProfileEntity>,
      contentRepository as unknown as Repository<ContentEntity>,
    );
  });

  it('debe agregar favorito y mapear respuesta', async () => {
    const profile = { id: 10, tipoPerfil: 'adulto' } as ProfileEntity;
    const content = {
      id: 21,
      titulo: 'Norte Incierto',
      tipoContenido: 'serie',
      clasificacionEdad: '+16',
      categoria: { id: 3, nombre: 'Drama', descripcion: null },
    } as unknown as ContentEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    const existingFavoriteQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    contentRepository.findOne.mockResolvedValue(content);
    favoriteRepository.createQueryBuilder.mockReturnValue(
      existingFavoriteQueryBuilder,
    );
    favoriteRepository.create.mockReturnValue({} as FavoriteEntity);
    favoriteRepository.save.mockResolvedValue({ id: 75 });

    const now = new Date('2026-04-10T14:20:00.000Z');
    favoriteRepository.findOne.mockResolvedValue({
      id: 75,
      perfil: profile,
      contenido: content,
      fechaAdicion: now,
    });

    const result = await service.addFavorite(99, {
      perfilId: 10,
      contenidoId: 21,
    });

    expect(result).toEqual({
      idFavorito: 75,
      perfilId: 10,
      contenidoId: 21,
      titulo: 'Norte Incierto',
      tipoContenido: 'serie',
      clasificacionEdad: '+16',
      categoria: {
        id: 3,
        nombre: 'Drama',
        descripcion: null,
      },
      fechaAdicion: now,
    });
  });

  it('debe bloquear favorito para perfil infantil con contenido restringido', async () => {
    const childProfile = { id: 5, tipoPerfil: 'infantil' } as ProfileEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(childProfile),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    contentRepository.findOne.mockResolvedValue({
      id: 44,
      clasificacionEdad: '+18',
    } as unknown as ContentEntity);

    await expect(
      service.addFavorite(9, {
        perfilId: 5,
        contenidoId: 44,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(favoriteRepository.save).not.toHaveBeenCalled();
  });

  it('debe listar favoritos respetando limite solicitado', async () => {
    const profile = { id: 10, tipoPerfil: 'adulto' } as ProfileEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    const listQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 501,
          perfil: { id: 10 },
          contenido: {
            id: 8,
            titulo: 'Origenes del Pacifico',
            tipoContenido: 'documental',
            clasificacionEdad: 'TP',
            categoria: {
              id: 4,
              nombre: 'Documental',
              descripcion: null,
            },
          },
          fechaAdicion: new Date('2026-04-10T12:00:00.000Z'),
        },
      ]),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    favoriteRepository.createQueryBuilder.mockReturnValue(listQueryBuilder);

    const result = await service.listFavorites(99, {
      perfilId: 10,
      limit: 7,
    });

    expect(listQueryBuilder.take).toHaveBeenCalledWith(7);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      idFavorito: 501,
      perfilId: 10,
      contenidoId: 8,
      titulo: 'Origenes del Pacifico',
    });
  });

  it('debe consultar estado de favorito para un contenido', async () => {
    const profile = { id: 10, tipoPerfil: 'adulto' } as ProfileEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    const statusQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    favoriteRepository.createQueryBuilder.mockReturnValue(statusQueryBuilder);

    const result = await service.getFavoriteStatus(99, {
      perfilId: 10,
      contenidoId: 18,
    });

    expect(result).toEqual({
      perfilId: 10,
      contenidoId: 18,
      esFavorito: true,
    });
  });

  it('debe bloquear operaciones cuando el perfil no pertenece al usuario', async () => {
    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);

    await expect(
      service.listFavorites(77, {
        perfilId: 99,
        limit: 5,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('debe crear calificacion y mapear respuesta', async () => {
    const profile = { id: 10, tipoPerfil: 'adulto' } as ProfileEntity;
    const content = {
      id: 21,
      titulo: 'Norte Incierto',
      tipoContenido: 'serie',
      clasificacionEdad: '+16',
      categoria: { id: 3, nombre: 'Drama', descripcion: null },
    } as unknown as ContentEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    const ratingByContentQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    contentRepository.findOne.mockResolvedValue(content);
    ratingRepository.createQueryBuilder.mockReturnValue(
      ratingByContentQueryBuilder,
    );
    ratingRepository.create.mockReturnValue({} as RatingEntity);
    ratingRepository.save.mockResolvedValue({ id: 910 });

    const now = new Date('2026-04-10T15:00:00.000Z');
    ratingRepository.findOne.mockResolvedValue({
      id: 910,
      perfil: profile,
      contenido: content,
      puntaje: 4,
      resena: 'Excelente ritmo',
      fechaCalificacion: now,
    });

    const result = await service.upsertRating(99, {
      perfilId: 10,
      contenidoId: 21,
      puntaje: 4,
      resena: 'Excelente ritmo',
    });

    expect(result).toEqual({
      idCalificacion: 910,
      perfilId: 10,
      contenidoId: 21,
      titulo: 'Norte Incierto',
      tipoContenido: 'serie',
      clasificacionEdad: '+16',
      categoria: {
        id: 3,
        nombre: 'Drama',
        descripcion: null,
      },
      puntaje: 4,
      resena: 'Excelente ritmo',
      fechaCalificacion: now,
    });
  });

  it('debe bloquear calificacion si no supera 50% de reproduccion', async () => {
    const profile = { id: 5, tipoPerfil: 'adulto' } as ProfileEntity;
    const content = {
      id: 44,
      titulo: 'Origenes del Pacifico',
      tipoContenido: 'documental',
      clasificacionEdad: 'TP',
      categoria: { id: 4, nombre: 'Documental', descripcion: null },
    } as unknown as ContentEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    const ratingByContentQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    contentRepository.findOne.mockResolvedValue(content);
    ratingRepository.createQueryBuilder.mockReturnValue(
      ratingByContentQueryBuilder,
    );
    ratingRepository.create.mockReturnValue({} as RatingEntity);
    ratingRepository.save.mockRejectedValue(
      new Error('ORA-20041: reproduccion insuficiente para calificar'),
    );

    await expect(
      service.upsertRating(9, {
        perfilId: 5,
        contenidoId: 44,
        puntaje: 5,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('debe consultar estado de calificacion por contenido', async () => {
    const profile = { id: 10, tipoPerfil: 'adulto' } as ProfileEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    const ratingByContentQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 400,
        perfil: { id: 10 },
        contenido: {
          id: 25,
          titulo: 'La Ciudad de las Sombras',
          tipoContenido: 'pelicula',
          clasificacionEdad: '+13',
          categoria: { id: 1, nombre: 'Accion', descripcion: null },
        },
        puntaje: 5,
        resena: 'Excelente',
        fechaCalificacion: new Date('2026-04-10T15:10:00.000Z'),
      }),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    ratingRepository.createQueryBuilder.mockReturnValue(
      ratingByContentQueryBuilder,
    );

    const result = await service.getRatingStatus(9, {
      perfilId: 10,
      contenidoId: 25,
    });

    expect(result).toEqual({
      perfilId: 10,
      contenidoId: 25,
      tieneCalificacion: true,
      puntaje: 5,
      resena: 'Excelente',
    });
  });
});
