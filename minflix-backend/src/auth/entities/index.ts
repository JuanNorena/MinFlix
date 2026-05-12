/**
 * Índice de exportación de entidades del módulo de autenticación.
 *
 * Centraliza las exportaciones de `UserEntity`, `PlanEntity` y `ProfileEntity`
 * para que otros módulos puedan importarlas desde una sola ruta:
 * `import { UserEntity, PlanEntity, ProfileEntity } from './entities'`.
 *
 * @see {@link UserEntity} para la entidad de cuentas de usuario
 * @see {@link PlanEntity} para la entidad de planes de suscripción
 * @see {@link ProfileEntity} para la entidad de perfiles de reproducción
 */

/** Entidad de cuentas de usuario (tabla `USUARIOS`) */
export { UserEntity } from './user.entity';

/** Entidad de planes de suscripción (tabla `PLANES`) */
export { PlanEntity } from './plan.entity';

/** Entidad de perfiles de reproducción (tabla `PERFILES`) */
export { ProfileEntity } from './profile.entity';
