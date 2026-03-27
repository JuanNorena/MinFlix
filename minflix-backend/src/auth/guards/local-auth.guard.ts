import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guarda de Passport para login con estrategia local.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
