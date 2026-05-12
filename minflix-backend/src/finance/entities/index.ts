/**
 * Índice de exportación de entidades del módulo financiero.
 *
 * Centraliza las exportaciones de `InvoiceEntity`, `PaymentEntity` y `ReferralEntity`.
 */

/** Entidad de facturación mensual (tabla `FACTURACIONES`) */
export { InvoiceEntity } from './invoice.entity';

/** Entidad de transacciones de pago (tabla `PAGOS`) */
export { PaymentEntity } from './payment.entity';

/** Entidad de relación de referidos (tabla `REFERIDOS`) */
export { ReferralEntity } from './referral.entity';
