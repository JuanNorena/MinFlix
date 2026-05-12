/** Decorador que define un módulo de NestJS con metadatos de importaciones, controladores y proveedores */
import { Module } from '@nestjs/common';

/** Módulo de NestJS para generación y validación de tokens JWT */
import { JwtModule } from '@nestjs/jwt';

/** Módulo de NestJS para integración con Passport.js */
import { PassportModule } from '@nestjs/passport';

/** Módulo y servicio de configuración para leer variables de entorno */
import { ConfigModule, ConfigService } from '@nestjs/config';

/** Módulo de TypeORM para registrar entidades en el contexto de persistencia */
import { TypeOrmModule } from '@nestjs/typeorm';

/** Controlador REST que expone los endpoints de autenticación y perfiles */
import { AuthController } from './auth.controller';

/** Servicio de lógica de negocio para autenticación y gestión de perfiles */
import { AuthService } from './auth.service';

/** Estrategia local de Passport para validar email y contraseña */
import { LocalStrategy } from './strategies/local.strategy';

/** Estrategia JWT de Passport para validar tokens Bearer */
import { JwtStrategy } from './strategies/jwt.strategy';

/** Entidades de autenticación: usuario, plan y perfil */
import { PlanEntity, ProfileEntity, UserEntity } from './entities';

/**
 * Módulo de autenticación y gestión de perfiles de usuario.
 *
 * Este módulo centraliza toda la lógica de autenticación de MinFlix,
 * incluyendo el registro de cuentas, inicio de sesión, gestión de perfiles
 * de reproducción y protección de rutas mediante JWT.
 *
 * @remarks
 * Utiliza Passport.js con dos estrategias principales:
 * - **Local Strategy**: Para autenticar con email y contraseña
 * - **JWT Strategy**: Para proteger endpoints privados con tokens Bearer
 *
 * El módulo gestiona tres entidades principales:
 * - `UserEntity`: Cuentas principales de usuarios
 * - `PlanEntity`: Planes de suscripción (Básico, Estándar, Premium)
 * - `ProfileEntity`: Perfiles de reproducción vinculados a cada cuenta
 *
 * @example
 * ```typescript
 * // Importar el módulo en otro módulo
 * @Module({
 *   imports: [AuthModule],
 * })
 * export class AppModule {}
 * ```
 *
 * @see {@link AuthService} para la lógica de negocio de autenticación
 * @see {@link AuthController} para los endpoints REST disponibles
 */
@Module({
  imports: [
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity, PlanEntity, ProfileEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'dev_jwt_secret',
        signOptions: {
          expiresIn: Number(
            configService.get<string>('JWT_EXPIRES_IN_SECONDS') ?? 3600,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
