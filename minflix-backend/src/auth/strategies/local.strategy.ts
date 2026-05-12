/** Decoradores de NestJS para inyección de dependencias y excepciones HTTP */
import { Injectable, UnauthorizedException } from '@nestjs/common';

/** Clase base de Passport para definir estrategias personalizadas en NestJS */
import { PassportStrategy } from '@nestjs/passport';

/** Estrategia local de Passport.js para autenticación con usuario/contraseña */
import { Strategy } from 'passport-local';

/** Servicio de autenticación para validar credenciales contra Oracle */
import { AuthService } from '../auth.service';

/**
 * Estrategia local de Passport para autenticar con email y contraseña.
 *
 * Esta clase implementa el flujo de autenticación tradicional de usuario/contraseña
 * para el endpoint de login. Passport ejecuta automáticamente esta estrategia cuando
 * un endpoint está protegido con `@UseGuards(LocalAuthGuard)`.
 *
 * @remarks
 * La estrategia está configurada para usar `email` como campo de usuario en lugar
 * del tradicional `username`. Valida las credenciales contra la base de datos Oracle
 * usando bcrypt para comparar hashes de contraseñas de forma segura.
 *
 * **Flujo de autenticación:**
 * 1. El cliente envía `email` y `password` en el body del POST `/api/v1/auth/login`
 * 2. Esta estrategia extrae las credenciales y las valida con `AuthService.validateUser`
 * 3. Si las credenciales son válidas, inyecta el usuario en `req.user`
 * 4. Si son inválidas, lanza `UnauthorizedException` (HTTP 401)
 *
 * @example
 * ```typescript
 * // Aplicar esta estrategia en el endpoint de login
 * @UseGuards(LocalAuthGuard)
 * @Post('login')
 * login(@Req() req: { user: { userId: number; email: string; role: string } }) {
 *   return this.authService.login(req.user); // Usuario ya validado por esta estrategia
 * }
 * ```
 *
 * @see {@link LocalAuthGuard} para aplicar esta estrategia en endpoints
 * @see {@link AuthService.validateUser} para la lógica de validación de credenciales
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor de la estrategia local.
   *
   * Configura Passport para usar `email` como campo de username en lugar del
   * campo predeterminado. Esto permite que el formulario de login use `email`
   * en lugar de `username`.
   *
   * @param authService - Servicio de autenticación para validar credenciales contra Oracle
   */
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * Valida credenciales de inicio de sesión contra la base de datos.
   *
   * Passport ejecuta este método automáticamente cuando se aplica `LocalAuthGuard`.
   * Delega la validación real al método privado `validateCredentials`.
   *
   * @param email - Correo electrónico suministrado por el cliente en el body
   * @param password - Contraseña en texto plano suministrada por el cliente
   *
   * @returns Promesa con el usuario autenticado que se inyecta en `req.user`
   *
   * @throws {@link UnauthorizedException}
   * Cuando el email no existe o la contraseña no coincide con el hash almacenado
   *
   * @example
   * ```typescript
   * // El cliente envía:
   * POST /api/v1/auth/login
   * { "email": "usuario@minflix.com", "password": "MiClave123*" }
   *
   * // Esta función valida y retorna:
   * { userId: 5, email: "usuario@minflix.com", role: "usuario" }
   * ```
   */
  validate(
    email: string,
    password: string,
  ): Promise<{ userId: number; email: string; role: string }> {
    return this.validateCredentials(email, password);
  }

  /**
   * Ejecuta la validación asíncrona de credenciales contra Oracle.
   *
   * Consulta la tabla `USUARIOS` en Oracle para verificar que:
   * 1. El email existe (case-insensitive)
   * 2. La cuenta está en estado `ACTIVO`
   * 3. La contraseña coincide con el hash bcrypt almacenado
   *
   * @param email - Correo electrónico a validar
   * @param password - Contraseña en texto plano a validar
   *
   * @returns Promesa con el usuario autenticado si las credenciales son válidas
   *
   * @throws {@link UnauthorizedException}
   * Cuando las credenciales son inválidas (email no existe, cuenta inactiva o contraseña incorrecta)
   *
   * @internal
   *
   * @example
   * ```typescript
   * // Contraseña correcta retorna el usuario
   * const usuario = await validateCredentials('user@minflix.com', 'Pass123*');
   * // { userId: 10, email: 'user@minflix.com', role: 'usuario' }
   *
   * // Contraseña incorrecta lanza excepción
   * await validateCredentials('user@minflix.com', 'Incorrecta');
   * // UnauthorizedException: Credenciales invalidas
   * ```
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
