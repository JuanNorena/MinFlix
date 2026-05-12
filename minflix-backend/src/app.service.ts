/**
 * Servicio raíz de la aplicación MinFlix Backend.
 *
 * Proporciona la lógica de verificación de estado del servicio,
 * consumida por el controlador raíz para health checks.
 *
 * @see {@link AppController} para el endpoint que expone este estado
 */

/** Decorador que marca la clase como proveedor inyectable en NestJS */
import { Injectable } from '@nestjs/common';

/**
 * Servicio de aplicación con la lógica de estado del backend.
 */
@Injectable()
export class AppService {
  /**
   * Retorna el estado actual del servicio.
   *
   * @returns Objeto con nombre del servicio y condición operativa
   */
  getStatus(): Record<string, string> {
    return {
      service: 'minflix-backend',
      status: 'ok',
    };
  }
}
