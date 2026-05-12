/**
 * Suite de pruebas unitarias para `AuthService.createProfile`.
 *
 * Verifica las reglas de negocio del módulo de autenticación relacionadas
 * con la creación de perfiles de reproducción, incluyendo:
 * - Rechazo cuando el usuario alcanza el límite de perfiles de su plan
 * - Traducción de errores Oracle (`ORA-20011`, `ORA-20012`) a excepciones HTTP
 * - Creación exitosa cuando el perfil está dentro del límite permitido
 *
 * @see {@link AuthService} para el servicio bajo prueba
 * @see {@link ProfileEntity} para la entidad de perfiles
 * @see {@link UserEntity} para la entidad de usuarios
 */

// --------------------------------------------------------------------------
// Importaciones de NestJS, TypeORM y entidades del módulo
// --------------------------------------------------------------------------

/** Excepciones HTTP de NestJS para validar comportamiento de errores */
import { BadRequestException, NotFoundException } from '@nestjs/common';

/** Servicio de configuración simulado para leer variables de entorno */
import { ConfigService } from '@nestjs/config';

/** Servicio JWT simulado para generación de tokens */
import { JwtService } from '@nestjs/jwt';

/** Clase base de repositorio de TypeORM para simular operaciones de base de datos */
import { Repository } from 'typeorm';

/** Entidades del módulo de autenticación */
import { PlanEntity, ProfileEntity, UserEntity } from './entities';

/** Servicio de autenticación bajo prueba */
import { AuthService } from './auth.service';

/**
 * Bloque de pruebas del método `createProfile` de AuthService.
 *
 * Aísla el servicio inyectando repositorios simulados (mocks) para validar
 * la lógica de negocio sin depender de una conexión real a Oracle.
 */
describe('AuthService createProfile', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
  };
  let planRepository: Partial<Repository<PlanEntity>>;
  let profileRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
    };

    profileRepository = {
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    planRepository = {};

    service = new AuthService(
      { signAsync: jest.fn() } as unknown as JwtService,
      { get: jest.fn() } as unknown as ConfigService,
      userRepository as unknown as Repository<UserEntity>,
      planRepository as Repository<PlanEntity>,
      profileRepository as unknown as Repository<ProfileEntity>,
    );
  });

  it('debe rechazar cuando el usuario alcanza el limite de perfiles del plan', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 7,
      plan: { limitePerfiles: 2 },
    });

    const countQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
    };

    profileRepository.createQueryBuilder.mockReturnValue(countQueryBuilder);

    await expect(
      service.createProfile(7, {
        nombre: 'Camila',
        tipoPerfil: 'adulto',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createProfile(7, {
        nombre: 'Camila',
        tipoPerfil: 'adulto',
      }),
    ).rejects.toThrow('El plan actual permite maximo 2 perfiles');
  });

  it('debe traducir ORA-20011 al crear perfil cuando dispara trigger de limite', async () => {
    const user = {
      id: 7,
      plan: { limitePerfiles: 4 },
    } as UserEntity;

    userRepository.findOne.mockResolvedValue(user);

    const countQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    };

    profileRepository.createQueryBuilder.mockReturnValue(countQueryBuilder);
    profileRepository.create.mockReturnValue({} as ProfileEntity);
    profileRepository.save.mockRejectedValue(
      new Error('ORA-20011: supera limite de perfiles'),
    );

    await expect(
      service.createProfile(7, {
        nombre: 'Sara',
        tipoPerfil: 'adulto',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createProfile(7, {
        nombre: 'Sara',
        tipoPerfil: 'adulto',
      }),
    ).rejects.toThrow('El plan actual permite maximo 4 perfiles');
  });

  it('debe traducir ORA-20012 cuando Oracle reporta usuario inexistente', async () => {
    const user = {
      id: 7,
      plan: { limitePerfiles: 4 },
    } as UserEntity;

    userRepository.findOne.mockResolvedValue(user);

    const countQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    };

    profileRepository.createQueryBuilder.mockReturnValue(countQueryBuilder);
    profileRepository.create.mockReturnValue({} as ProfileEntity);
    profileRepository.save.mockRejectedValue(
      new Error('ORA-20012: usuario no existe'),
    );

    await expect(
      service.createProfile(7, {
        nombre: 'Sara',
        tipoPerfil: 'adulto',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('debe crear perfil cuando esta dentro del limite', async () => {
    const user = {
      id: 7,
      plan: { limitePerfiles: 4 },
    } as UserEntity;

    userRepository.findOne.mockResolvedValue(user);

    const countQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
    };

    profileRepository.createQueryBuilder.mockReturnValue(countQueryBuilder);
    profileRepository.create.mockReturnValue({} as ProfileEntity);
    profileRepository.save.mockResolvedValue({
      id: 40,
      nombre: 'Nora',
      avatar: null,
      tipoPerfil: 'infantil',
    });

    const result = await service.createProfile(7, {
      nombre: 'Nora',
      tipoPerfil: 'infantil',
      avatar: undefined,
    });

    expect(result).toEqual({
      id: 40,
      nombre: 'Nora',
      avatar: null,
      tipoPerfil: 'infantil',
    });
  });
});
