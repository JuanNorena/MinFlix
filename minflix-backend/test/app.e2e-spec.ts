/**
 * Pruebas end-to-end (E2E) del controlador raíz de MinFlix.
 *
 * Verifica que la aplicación NestJS se levante correctamente y que el
 * endpoint base (`GET /`) responda con el estado esperado del servicio.
 *
 * @see {@link AppModule} para el módulo raíz bajo prueba
 * @see {@link AppController} para el controlador que expone el endpoint de salud
 */

/** Utilidad para crear módulos de prueba con inyección de dependencias */
import { Test, TestingModule } from '@nestjs/testing';

/** Tipo de aplicación NestJS para gestión del ciclo de vida en pruebas */
import { INestApplication } from '@nestjs/common';

/** Cliente HTTP para realizar peticiones en pruebas E2E */
import request from 'supertest';

/** Tipo de aplicación de Supertest */
import { App } from 'supertest/types';

/** Módulo raíz de la aplicación bajo prueba */
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
