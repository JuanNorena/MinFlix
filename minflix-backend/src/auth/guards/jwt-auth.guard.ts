import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guarda de autenticación para proteger endpoints que requieren usuario autenticado.
 *
 * Este guard activa la estrategia JWT de Passport, que valida el token Bearer
 * enviado en el header `Authorization`. Si el token es válido, permite el acceso
 * al endpoint e inyecta los datos del usuario en `req.user`. Si el token no existe,
 * está expirado o es inválido, rechaza la petición con HTTP 401 Unauthorized.
 *
 * @remarks
 * Úsalo con el decorador `@UseGuards(JwtAuthGuard)` en controladores o métodos
 * individuales para proteger endpoints que requieren autenticación.
 *
 * **Funcionamiento interno:**
 * 1. Extrae el token del header `Authorization: Bearer <token>`
 * 2. Valida la firma del token usando `JWT_SECRET`
 * 3. Verifica que el token no haya expirado
 * 4. Decodifica el payload y lo inyecta en `req.user` vía `JwtStrategy.validate`
 * 5. Permite continuar con el endpoint si todo es válido
 *
 * @example
 * ```typescript
 * // Proteger un endpoint individual
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Req() req: { user: { userId: number; email: string; role: string } }) {
 *   // req.user contiene la identidad del usuario extraída del token JWT
 *   return { mensaje: `Hola, ${req.user.email}` };
 * }
 *
 * // Proteger todo un controlador
 * @Controller('api/v1/privado')
 * @UseGuards(JwtAuthGuard)
 * export class PrivadoController {
 *   // Todos los endpoints de este controlador requieren JWT válido
 * }
 * ```
 *
 * @see {@link JwtStrategy} para la lógica de validación del token
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
