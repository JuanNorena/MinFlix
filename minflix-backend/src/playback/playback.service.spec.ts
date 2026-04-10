import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
import { ContinueWatchingEntity, PlaybackEntity } from './entities';
import { PlaybackService } from './playback.service';

describe('PlaybackService', () => {
  let service: PlaybackService;
  let playbackRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let continueWatchingRepository: {
    createQueryBuilder: jest.Mock;
  };
  let profileRepository: {
    createQueryBuilder: jest.Mock;
  };
  let contentRepository: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    playbackRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    continueWatchingRepository = {
      createQueryBuilder: jest.fn(),
    };

    profileRepository = {
      createQueryBuilder: jest.fn(),
    };

    contentRepository = {
      findOne: jest.fn(),
    };

    service = new PlaybackService(
      playbackRepository as unknown as Repository<PlaybackEntity>,
      continueWatchingRepository as unknown as Repository<ContinueWatchingEntity>,
      profileRepository as unknown as Repository<ProfileEntity>,
      contentRepository as unknown as Repository<ContentEntity>,
    );
  });

  it('debe registrar inicio de reproduccion y mapear la respuesta', async () => {
    const profile = { id: 10 } as ProfileEntity;
    const content = { id: 20 } as ContentEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    contentRepository.findOne.mockResolvedValue(content);

    playbackRepository.create.mockReturnValue({} as PlaybackEntity);
    playbackRepository.save.mockResolvedValue({ id: 77 });

    const now = new Date('2026-04-10T03:00:00.000Z');
    playbackRepository.findOne.mockResolvedValue({
      id: 77,
      perfil: profile,
      contenido: content,
      progresoSegundos: 0,
      duracionTotalSegundos: 600,
      porcentajeAvance: 0,
      ultimoDispositivo: 'Web',
      estadoReproduccion: 'EN_PROGRESO',
      fechaInicio: now,
      fechaUltimoEvento: now,
      fechaFin: undefined,
    });

    const result = await service.startPlayback(99, {
      perfilId: 10,
      contenidoId: 20,
      duracionTotalSegundos: 600,
      ultimoDispositivo: 'Web',
    });

    expect(result).toEqual({
      idReproduccion: 77,
      perfilId: 10,
      contenidoId: 20,
      progresoSegundos: 0,
      duracionTotalSegundos: 600,
      porcentajeAvance: 0,
      ultimoDispositivo: 'Web',
      estadoReproduccion: 'EN_PROGRESO',
      fechaInicio: now,
      fechaUltimoEvento: now,
      fechaFin: null,
    });
    expect(playbackRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debe traducir ORA-20023 cuando el progreso supera la duracion', async () => {
    const profile = { id: 1 } as ProfileEntity;
    const content = { id: 5 } as ContentEntity;

    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(profile),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    contentRepository.findOne.mockResolvedValue(content);
    playbackRepository.create.mockReturnValue({} as PlaybackEntity);
    playbackRepository.save.mockRejectedValue(
      new Error('ORA-20023: El progreso no puede superar la duracion total'),
    );

    await expect(
      service.reportProgress(99, {
        perfilId: 1,
        contenidoId: 5,
        progresoSegundos: 1200,
        duracionTotalSegundos: 300,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.reportProgress(99, {
        perfilId: 1,
        contenidoId: 5,
        progresoSegundos: 1200,
        duracionTotalSegundos: 300,
      }),
    ).rejects.toThrow(
      'El progreso no puede superar la duracion total del contenido',
    );
  });

  it('debe bloquear continuar viendo cuando el perfil no pertenece al usuario', async () => {
    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);

    await expect(
      service.listContinueWatching(50, {
        perfilId: 9,
        limit: 12,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('debe listar continuar viendo respetando el limite solicitado', async () => {
    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 10 } as ProfileEntity),
    };

    const continueWatchingQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          idReproduccion: 100,
          perfilId: 10,
          contenidoId: 22,
          titulo: 'Norte Incierto',
          clasificacionEdad: '+16',
          tipoContenido: 'serie',
          progresoSegundos: 1800,
          duracionTotalSegundos: 3600,
          porcentajeAvance: 50,
          ultimoDispositivo: 'Web',
          estadoReproduccion: 'EN_PROGRESO',
          fechaUltimoEvento: new Date('2026-04-10T02:30:00.000Z'),
        },
      ]),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    continueWatchingRepository.createQueryBuilder.mockReturnValue(
      continueWatchingQueryBuilder,
    );

    const result = await service.listContinueWatching(99, {
      perfilId: 10,
      limit: 5,
    });

    expect(continueWatchingQueryBuilder.take).toHaveBeenCalledWith(5);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      idReproduccion: 100,
      perfilId: 10,
      contenidoId: 22,
      titulo: 'Norte Incierto',
      porcentajeAvance: 50,
    });
  });

  it('debe listar historial de reproduccion con filtro por estado', async () => {
    const ownershipQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 10 } as ProfileEntity),
    };

    const historyQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 701,
          perfil: { id: 10 },
          contenido: {
            id: 44,
            titulo: 'Origenes del Pacifico',
            tipoContenido: 'documental',
            clasificacionEdad: 'TP',
          },
          progresoSegundos: 2000,
          duracionTotalSegundos: 4000,
          porcentajeAvance: 50,
          ultimoDispositivo: 'Web',
          estadoReproduccion: 'PAUSADO',
          fechaInicio: new Date('2026-04-10T01:00:00.000Z'),
          fechaUltimoEvento: new Date('2026-04-10T01:40:00.000Z'),
          fechaFin: undefined,
        },
      ]),
    };

    profileRepository.createQueryBuilder.mockReturnValue(ownershipQueryBuilder);
    playbackRepository.createQueryBuilder.mockReturnValue(historyQueryBuilder);

    const result = await service.listPlaybackHistory(99, {
      perfilId: 10,
      limit: 7,
      estadoReproduccion: 'PAUSADO',
    });

    expect(historyQueryBuilder.take).toHaveBeenCalledWith(7);
    expect(historyQueryBuilder.andWhere).toHaveBeenCalledWith(
      'reproduccion.estadoReproduccion = :estadoReproduccion',
      {
        estadoReproduccion: 'PAUSADO',
      },
    );
    expect(result[0]).toMatchObject({
      idReproduccion: 701,
      perfilId: 10,
      contenidoId: 44,
      titulo: 'Origenes del Pacifico',
      estadoReproduccion: 'PAUSADO',
    });
  });
});
