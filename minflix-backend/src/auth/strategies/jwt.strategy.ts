import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Estrategia JWT de Passport para proteger endpoints privados.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'dev_jwt_secret',
    });
  }

  /**
   * Normaliza el payload JWT para uso interno de la API.
   * @param payload - Carga util del token.
   * @returns Usuario autenticado para resolvers/controladores.
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
