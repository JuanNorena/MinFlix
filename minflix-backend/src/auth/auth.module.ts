import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
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
