/**
 * Índice de exportación de entidades del módulo de reproducción.
 *
 * Centraliza las exportaciones de `PlaybackEntity` y `ContinueWatchingEntity`.
 */

/** Entidad de eventos de reproducción (tabla `REPRODUCCIONES`) */
export { PlaybackEntity } from './playback.entity';

/** Entidad de solo lectura para la vista `VW_CONTINUAR_VIENDO` */
export { ContinueWatchingEntity } from './continue-watching.entity';
