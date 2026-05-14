/**
 * Módulo de demostración académica para los núcleos temáticos NT1..NT4.
 *
 * Expone endpoints de solo lectura que ejecutan consultas SQL nativas
 * contra el diccionario de datos de Oracle y las vistas/funciones académicas.
 */

/** Decorador de módulo de NestJS */
import { Module } from '@nestjs/common';

/** Controlador de showcase académico */
import { ShowcaseController } from './showcase.controller';

/** Servicio de consultas nativas para showcase */
import { ShowcaseService } from './showcase.service';

@Module({
  controllers: [ShowcaseController],
  providers: [ShowcaseService],
})
export class ShowcaseModule {}
