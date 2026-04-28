import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Estrategia JWT de Passport para proteger endpoints privados con tokens Bearer.
 *
 * Esta clase implementa la validación de tokens JWT que el cliente envía
 * en el header `Authorization: Bearer <token>`. Passport.js ejecuta automáticamente
 * esta estrategia cuando un endpoint está protegido con `@UseGuards(JwtAuthGuard)`.
 *
 * @remarks
 * La estrategia extrae el token del header Authorization, lo valida usando
 * el secreto configurado en `JWT_SECRET`, y expone el payload decodificado
 * en `req.user` para que los controladores puedan acceder a la identidad
 * del usuario autenticado.
 *
 * **Configuración:**
 * - Extrae el token del header como Bearer token
 * - No ignora tokens expirados (rechaza tokens vencidos)
 * - Usa `JWT_SECRET` del archivo `.env` o un secreto por defecto en desarrollo
 *
 * @example
 * ```typescript
 * // Uso automático cuando se aplica el guard JWT
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Req() req: { user: { userId: number; email: string } }) {
 *   return req.user; // Usuario extraído del token por esta estrategia
 * }
 * ```
 *
 * @see {@link JwtAuthGuard} para aplicar esta estrategia en endpoints
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor de la estrategia JWT.
   *
   * Configura Passport para extraer y validar tokens JWT del header Authorization.
   * El secreto se obtiene de las variables de entorno mediante ConfigService.
   *
   * @param configService - Servicio de configuración de NestJS para acceder a variables de entorno
   */
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'dev_jwt_secret',
    });
  }

  /**
   * Normaliza el payload JWT decodificado para uso interno de la API.
   *
   * Passport ejecuta este método automáticamente después de validar el token.
   * Transforma el formato interno del JWT (con `sub` para el ID) al formato
   * que usan los controladores de MinFlix (con `userId`).
   *
   * @param payload - Carga útil del token JWT decodificado
   * @param payload.sub - ID del usuario (estándar JWT para subject)
   * @param payload.email - Email del usuario autenticado
   * @param payload.role - Rol del usuario (usuario, admin, soporte, analista)
   *
   * @returns Objeto de usuario normalizado que se inyecta en `req.user`
   *
   * @example
   * ```typescript
   * // El payload JWT original es:
   * { sub: 5, email: 'usuario@minflix.com', role: 'usuario' }
   *
   * // Esta función lo transforma a:
   * { userId: 5, email: 'usuario@minflix.com', role: 'usuario' }
   * ```
   */
  validate(payload: { sub: number; email: string; role: string }): {
    userId: number;
    email: string;
    role: string;
  } {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
