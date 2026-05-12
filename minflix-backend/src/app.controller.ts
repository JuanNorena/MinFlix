/**
 * Controlador raíz de la aplicación MinFlix Backend.
 *
 * Expone el endpoint principal de verificación de salud del servicio,
 * útil para health checks de balanceadores, monitoreo y despliegues.
 *
 * @see {@link AppService} para la lógica de verificación de estado
 * @see {@link main.ts} para la configuración de arranque del servidor
 */

// --------------------------------------------------------------------------
// Importaciones principales
// --------------------------------------------------------------------------

/** Decorador que define una clase como controlador REST de NestJS */
import { Controller, Get } from '@nestjs/common';

/** Servicio raíz que contiene la lógica de estado del backend */
import { AppService } from './app.service';

/**
 * Controlador raíz de la aplicación.
 *
 * Responde en la ruta base (`GET /`) con el estado de salud del servicio.
 */
@Controller()
export class AppController {
  /**
   * Constructor que inyecta el servicio de aplicación.
   *
   * @param appService - Instancia de {@link AppService} con la lógica de estado
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint de verificación de salud del servicio.
   *
   * @returns Estado actual del servicio con nombre y condición
   *
   * @example
   * ```
   * GET /
   * // Respuesta: { service: 'minflix-backend', status: 'ok' }
   * ```
   */
  @Get()
  getStatus(): Record<string, string> {
    return this.appService.getStatus();
  }
}
