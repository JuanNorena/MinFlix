import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guarda de Passport para proteger rutas con JWT.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
