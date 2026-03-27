import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Servicio de autenticacion base para el arranque del proyecto.
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Valida credenciales de usuario.
   * @param email - Correo del usuario.
   * @param password - Contrasena en texto plano.
   * @returns Usuario minimo autenticado o null si no coincide.
   */
  validateUser(
    email: string,
    password: string,
  ): { userId: number; email: string; role: string } | null {
    if (email === 'admin@minflix.com' && password === 'Admin123*') {
      return {
        userId: 1,
        email,
        role: 'admin',
      };
    }

    return null;
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
}
