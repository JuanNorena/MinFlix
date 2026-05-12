/**
 * Suite de pruebas unitarias para el controlador raíz de la aplicación.
 *
 * Verifica que el endpoint de estado de salud responda correctamente
 * cuando el servicio subyacente opera normalmente.
 */

// --------------------------------------------------------------------------
// Importaciones de NestJS Testing
// --------------------------------------------------------------------------

/** Utilidad para crear módulos de prueba con inyección de dependencias */
import { Test, TestingModule } from '@nestjs/testing';

/** Controlador bajo prueba */
import { AppController } from './app.controller';

/** Servicio simulado que provee el estado del backend */
import { AppService } from './app.service';

/**
 * Bloque de pruebas del controlador raíz.
 *
 * Aísla el controlador inyectando el servicio real para validar
 * la respuesta del endpoint de salud.
 */
describe('AppController', () => {
  /** Instancia del controlador extraída del módulo de prueba */
  let appController: AppController;

  /**
   * Configuración previa a cada prueba: compila un módulo de prueba
   * con el controlador y el servicio.
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * Prueba del endpoint raíz.
   *
   * Valida que `GET /` retorne el objeto de estado esperado.
   */
  describe('root', () => {
    it('should return service health status', () => {
      expect(appController.getStatus()).toEqual({
        service: 'minflix-backend',
        status: 'ok',
      });
    });
  });
});
