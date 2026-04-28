import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guarda de autenticación para el endpoint de inicio de sesión con email y contraseña.
 *
 * Este guard activa la estrategia local de Passport, que valida credenciales de usuario
 * (email y password) contra la base de datos Oracle. Se usa exclusivamente en el endpoint
 * de login para autenticar usuarios antes de generar el token JWT.
 *
 * @remarks
 * **Flujo de autenticación completo:**
 * 1. El cliente envía `POST /api/v1/auth/login` con `{ email, password }` en el body
 * 2. Este guard activa `LocalStrategy`
 * 3. `LocalStrategy` llama a `AuthService.validateUser` para verificar credenciales
 * 4. Si las credenciales son válidas, inyecta el usuario en `req.user`
 * 5. El controlador genera y devuelve un JWT usando `AuthService.login`
 * 6. Si las credenciales son inválidas, se lanza `UnauthorizedException` (HTTP 401)
 *
 * **Diferencia con JwtAuthGuard:**
 * - `LocalAuthGuard`: Valida email + password → Usado solo en login
 * - `JwtAuthGuard`: Valida token JWT → Usado en todos los endpoints protegidos
 *
 * @example
 * ```typescript
 * // Aplicar en el endpoint de login
 * @UseGuards(LocalAuthGuard)
 * @Post('login')
 * async login(
 *   @Body() loginDto: LoginDto,
 *   @Req() req: { user: { userId: number; email: string; role: string } }
 * ) {
 *   // En este punto, LocalAuthGuard ya validó las credenciales
 *   // y req.user contiene los datos del usuario autenticado
 *   return this.authService.login(req.user); // Genera el JWT
 * }
 *
 * // El cliente recibe:
 * {
 *   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": 5,
 *     "email": "usuario@minflix.com",
 *     "role": "usuario"
 *   }
 * }
 * ```
 *
 * @see {@link LocalStrategy} para la lógica de validación de credenciales
 * @see {@link AuthService.validateUser} para la verificación contra Oracle
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
