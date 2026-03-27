import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PlanEntity, ProfileEntity, UserEntity } from './entities';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

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
}
