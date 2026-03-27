import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * Estrategia local de Passport para autenticar email y contrasena.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * Valida credenciales y retorna el payload minimo del usuario.
   * @param email - Correo suministrado por el cliente.
   * @param password - Contrasena suministrada por el cliente.
   * @returns Usuario autenticado para inyectar en el request.
   * @throws UnauthorizedException Cuando las credenciales no son validas.
   */
  validate(
    email: string,
    password: string,
  ): Promise<{ userId: number; email: string; role: string }> {
    return this.validateCredentials(email, password);
  }

  /**
   * Ejecuta la validacion asincrona de credenciales.
   * @param email - Correo suministrado por el cliente.
   * @param password - Contrasena suministrada por el cliente.
   * @returns Usuario autenticado para inyectar en el request.
   * @throws UnauthorizedException Cuando las credenciales no son validas.
   */
  private async validateCredentials(
    email: string,
    password: string,
  ): Promise<{ userId: number; email: string; role: string }> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return user;
  }
}
