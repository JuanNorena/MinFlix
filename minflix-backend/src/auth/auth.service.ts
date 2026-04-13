import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PlanEntity, ProfileEntity, UserEntity } from './entities';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/**
 * Servicio de autenticacion base para el arranque del proyecto.
 */
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PlanEntity)
    private readonly planRepository: Repository<PlanEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
  ) {}

  /**
   * Inicializa datos minimos de autenticacion al arrancar.
   * @returns Promesa completada cuando termina la inicializacion.
   */
  async onModuleInit(): Promise<void> {
    await this.ensureAdminSeed();
  }

  /**
   * Valida credenciales de usuario.
   * @param email - Correo del usuario.
   * @param password - Contrasena en texto plano.
   * @returns Usuario minimo autenticado o null si no coincide.
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ userId: number; email: string; role: string } | null> {
    const user = await this.userRepository
      .createQueryBuilder('usuario')
      .where('UPPER(usuario.email) = UPPER(:email)', { email })
      .andWhere('usuario.estadoCuenta = :estado', { estado: 'ACTIVO' })
      .getOne();

    if (!user) {
      return null;
    }

    const passwordMatch = await compare(password, user.passwordHash);
    if (!passwordMatch) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.rol,
    };
  }

  /**
   * Genera token de acceso para un usuario autenticado.
   * @param user - Usuario autenticado.
   * @returns Objeto con access token y datos basicos.
   */
  async login(user: { userId: number; email: string; role: string }): Promise<{
    accessToken: string;
    user: { id: number; email: string; role: string };
  }> {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Registra una cuenta principal y su perfil inicial.
   * @param payload - Datos de registro de cuenta.
   * @returns Token y datos basicos del usuario creado.
   */
  async register(payload: RegisterDto): Promise<{
    accessToken: string;
    user: { id: number; email: string; role: string };
  }> {
    const existingUser = await this.userRepository
      .createQueryBuilder('usuario')
      .where('UPPER(usuario.email) = UPPER(:email)', { email: payload.email })
      .getOne();

    if (existingUser) {
      throw new BadRequestException('El correo ya se encuentra registrado');
    }

    const planNombre = payload.planNombre ?? 'BASICO';
    const plan = await this.planRepository
      .createQueryBuilder('plan')
      .where('UPPER(plan.nombre) = UPPER(:nombre)', { nombre: planNombre })
      .getOne();

    if (!plan) {
      throw new BadRequestException('El plan seleccionado no existe');
    }

    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') ?? '12',
    );
    const passwordHash = await hash(payload.password, saltRounds);

    const savedUser = await this.userRepository.save(
      this.userRepository.create({
        nombre: payload.nombre,
        email: payload.email,
        telefono: payload.telefono,
        fechaNacimiento: new Date(payload.fechaNacimiento),
        ciudadResidencia: payload.ciudadResidencia,
        passwordHash,
        rol: 'usuario',
        estadoCuenta: 'ACTIVO',
        plan,
      }),
    );

    await this.profileRepository.save(
      this.profileRepository.create({
        nombre: payload.nombrePerfilInicial ?? payload.nombre,
        tipoPerfil: 'adulto',
        usuario: savedUser,
      }),
    );

    return this.login({
      userId: savedUser.id,
      email: savedUser.email,
      role: savedUser.rol,
    });
  }

  /**
   * Lista los perfiles registrados para una cuenta.
   * @param userId - Identificador de la cuenta autenticada.
   * @returns Coleccion de perfiles visibles para la cuenta.
   */
  async listProfiles(userId: number): Promise<
    Array<{
      id: number;
      nombre: string;
      avatar: string | null;
      tipoPerfil: string;
    }>
  > {
    const profiles = await this.profileRepository
      .createQueryBuilder('perfil')
      .innerJoin('perfil.usuario', 'usuario')
      .where('usuario.id = :userId', { userId })
      .orderBy('perfil.id', 'ASC')
      .getMany();

    return profiles.map((profile) => ({
      id: profile.id,
      nombre: profile.nombre,
      avatar: profile.avatar ?? null,
      tipoPerfil: profile.tipoPerfil,
    }));
  }

  /**
   * Crea un perfil adicional para una cuenta validando el limite del plan.
   * @param userId - Identificador de la cuenta autenticada.
   * @param payload - Datos del perfil a crear.
   * @returns Perfil creado.
   */
  async createProfile(
    userId: number,
    payload: CreateProfileDto,
  ): Promise<{
    id: number;
    nombre: string;
    avatar: string | null;
    tipoPerfil: string;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { plan: true },
    });

    if (!user) {
      throw new NotFoundException('La cuenta autenticada no existe');
    }

    const currentProfiles = await this.profileRepository
      .createQueryBuilder('perfil')
      .innerJoin('perfil.usuario', 'usuario')
      .where('usuario.id = :userId', { userId })
      .getCount();

    const profileLimit = user.plan?.limitePerfiles ?? 1;
    if (currentProfiles >= profileLimit) {
      throw new BadRequestException(
        `El plan actual permite maximo ${profileLimit} perfiles`,
      );
    }

    try {
      const savedProfile = await this.profileRepository.save(
        this.profileRepository.create({
          nombre: payload.nombre,
          avatar: payload.avatar,
          tipoPerfil: payload.tipoPerfil,
          usuario: user,
        }),
      );

      return {
        id: savedProfile.id,
        nombre: savedProfile.nombre,
        avatar: savedProfile.avatar ?? null,
        tipoPerfil: savedProfile.tipoPerfil,
      };
    } catch (error) {
      if (this.isOracleBusinessRuleError(error, 'ORA-20011')) {
        throw new BadRequestException(
          `El plan actual permite maximo ${profileLimit} perfiles`,
        );
      }

      if (this.isOracleBusinessRuleError(error, 'ORA-20012')) {
        throw new NotFoundException('La cuenta autenticada no existe');
      }

      throw error;
    }
  }

  /**
   * Actualiza los datos editables de un perfil perteneciente al usuario.
   * @param userId - Identificador de la cuenta autenticada.
   * @param profileId - Identificador del perfil.
   * @param payload - Campos a actualizar del perfil.
   * @returns Perfil actualizado.
   */
  async updateProfile(
    userId: number,
    profileId: number,
    payload: UpdateProfileDto,
  ): Promise<{
    id: number;
    nombre: string;
    avatar: string | null;
    tipoPerfil: string;
  }> {
    if (
      payload.nombre === undefined &&
      payload.avatar === undefined &&
      payload.tipoPerfil === undefined
    ) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar',
      );
    }

    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: { usuario: true },
    });

    if (!profile || profile.usuario.id !== userId) {
      throw new NotFoundException('Perfil no encontrado para la cuenta actual');
    }

    if (payload.nombre !== undefined) {
      profile.nombre = payload.nombre;
    }

    if (payload.avatar !== undefined) {
      profile.avatar = payload.avatar;
    }

    if (payload.tipoPerfil !== undefined) {
      profile.tipoPerfil = payload.tipoPerfil;
    }

    const savedProfile = await this.profileRepository.save(profile);

    return {
      id: savedProfile.id,
      nombre: savedProfile.nombre,
      avatar: savedProfile.avatar ?? null,
      tipoPerfil: savedProfile.tipoPerfil,
    };
  }

  /**
   * Elimina un perfil de la cuenta siempre que exista al menos uno restante.
   * @param userId - Identificador de la cuenta autenticada.
   * @param profileId - Identificador del perfil a eliminar.
   * @returns Confirmacion de eliminacion.
   */
  async deleteProfile(
    userId: number,
    profileId: number,
  ): Promise<{ message: string }> {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
      relations: { usuario: true },
    });

    if (!profile || profile.usuario.id !== userId) {
      throw new NotFoundException('Perfil no encontrado para la cuenta actual');
    }

    const currentProfiles = await this.profileRepository
      .createQueryBuilder('perfil')
      .innerJoin('perfil.usuario', 'usuario')
      .where('usuario.id = :userId', { userId })
      .getCount();

    if (currentProfiles <= 1) {
      throw new BadRequestException(
        'La cuenta debe conservar al menos un perfil activo',
      );
    }

    await this.profileRepository.remove(profile);

    return { message: 'Perfil eliminado correctamente' };
  }

  /**
   * Construye la URL publica de avatar para exponerla al frontend.
   * @param req - Request HTTP actual para resolver host.
   * @param fileName - Nombre final del archivo persistido.
   * @returns Metadata publica del recurso cargado.
   */
  resolveAvatarAsset(
    req: Request,
    fileName: string,
  ): { avatarUrl: string; avatarPath: string } {
    const configuredBaseUrl = this.configService.get<string>('PUBLIC_BASE_URL');
    const fallbackHost = req.get('host') ?? 'localhost:3000';
    const computedBaseUrl = `${req.protocol}://${fallbackHost}`;
    const baseUrl = (configuredBaseUrl ?? computedBaseUrl).replace(/\/$/, '');
    const avatarPath = `/uploads/avatars/${fileName}`;

    return {
      avatarUrl: `${baseUrl}${avatarPath}`,
      avatarPath,
    };
  }

  /**
   * Crea un usuario administrador inicial si esta habilitado por entorno.
   * @returns Promesa completada cuando termina el seed.
   */
  private async ensureAdminSeed(): Promise<void> {
    const enabled =
      this.configService.get<string>('AUTH_SEED_ADMIN_ENABLED') === 'true';

    if (!enabled) {
      return;
    }

    const adminEmail =
      this.configService.get<string>('AUTH_SEED_ADMIN_EMAIL') ??
      'admin@minflix.com';
    const adminPassword =
      this.configService.get<string>('AUTH_SEED_ADMIN_PASSWORD') ?? 'Admin123*';
    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') ?? '12',
    );

    try {
      const existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        return;
      }

      const passwordHash = await hash(adminPassword, saltRounds);

      await this.userRepository.save(
        this.userRepository.create({
          nombre: 'Administrador MinFlix',
          email: adminEmail,
          telefono: '3000000001',
          fechaNacimiento: new Date('1985-01-01'),
          ciudadResidencia: 'Bogota',
          passwordHash,
          rol: 'admin',
          estadoCuenta: 'ACTIVO',
        }),
      );
    } catch (error) {
      if (this.isOracleMissingTableError(error)) {
        const dbUser =
          this.configService.get<string>('DB_USER')?.toUpperCase() ??
          'NO_DEFINIDO';
        const dbSchema =
          this.configService.get<string>('DB_SCHEMA')?.toUpperCase() ??
          '(vacío)';

        this.logger.warn(
          [
            'No se pudo ejecutar el seed de admin porque la tabla USUARIOS no existe en el esquema configurado.',
            `DB_USER=${dbUser}, DB_SCHEMA=${dbSchema}.`,
            'Verifique el owner real de tablas y ajuste DB_SCHEMA o recree tablas en el esquema esperado.',
          ].join(' '),
        );
        return;
      }

      throw error;
    }
  }

  /**
   * Determina si la excepcion corresponde a ORA-00942 (tabla o vista no existe).
   * @param error - Error capturado en operación de base de datos.
   * @returns True si coincide con ORA-00942.
   */
  private isOracleMissingTableError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.message.includes('ORA-00942') ||
      error.message.includes('tabla o vista')
    );
  }

  /**
   * Determina si un error corresponde a una regla de negocio Oracle.
   * @param error - Error capturado en operación de base de datos.
   * @param oracleCode - Codigo Oracle esperado, por ejemplo ORA-20011.
   * @returns True si el mensaje contiene el codigo esperado.
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
