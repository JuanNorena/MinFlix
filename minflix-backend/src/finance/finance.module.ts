import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { InvoiceEntity, PaymentEntity, ReferralEntity } from './entities';

/**
 * Módulo financiero para facturación, pagos y sistema de referidos.
 *
 * Este módulo implementa el sistema completo de gestión financiera de MinFlix,
 * incluyendo facturación mensual automatizada, procesamiento de pagos simulados
 * para fines académicos, y el sistema de referidos con descuentos.
 *
 * @remarks
 * **Entidades gestionadas:**
 * - `InvoiceEntity`: Facturas mensuales generadas automáticamente por Oracle
 * - `PaymentEntity`: Transacciones de pago de facturas
 * - `ReferralEntity`: Relaciones de referidos entre usuarios con descuentos
 * - `UserEntity`: Usuarios propietarios de facturas y pagos
 *
 * **Funcionalidades principales:**
 *
 * **1. Facturación:**
 * - Consultar resumen financiero de la cuenta
 * - Listar facturas históricas con filtros por periodo y estado
 * - Estados: PENDIENTE, PAGADA, VENCIDA
 * - Cálculo automático de descuentos (referidos + fidelidad)
 * - Generación mensual automática vía job Oracle
 *
 * **2. Pagos:**
 * - Simular checkout de pago de facturas (sin pasarela real)
 * - Listar historial de transacciones de pago
 * - Captura de datos de tarjeta solo para UX (NO se procesan realmente)
 * - Estados de transacción: EXITOSO, FALLIDO, PENDIENTE
 * - Actualización automática de estado de factura tras pago
 *
 * **3. Sistema de Referidos:**
 * - Listar relaciones de referidos (como referente o referido)
 * - Tipos de relación: REFERENTE (quien invita) o REFERIDO (invitado)
 * - Estados: PENDIENTE, VALIDADO, CADUCADO
 * - Descuentos porcentuales aplicados automáticamente en facturas
 * - Validación automática tras cumplir condiciones
 *
 * **4. Automatización Oracle:**
 * - Facturas generadas automáticamente el día 1 de cada mes
 * - Cálculo de descuentos por referidos y fidelidad
 * - Vencimiento de facturas a 15 días
 * - Triggers para mantener coherencia de estados
 *
 * **Endpoints expuestos:**
 * - `GET /api/v1/finance/summary` - Resumen financiero de la cuenta
 * - `GET /api/v1/finance/invoices` - Listar facturas con filtros
 * - `GET /api/v1/finance/payments` - Listar historial de pagos
 * - `POST /api/v1/finance/payments/checkout` - Simular pago de factura
 * - `GET /api/v1/finance/referrals` - Listar relaciones de referidos
 *
 * **IMPORTANTE - Pagos Simulados:**
 * Este es un proyecto académico. Los pagos son simulados y no se conectan
 * a ninguna pasarela de pago real. Los datos de tarjeta capturados en la UI
 * se usan solo para validar la experiencia de usuario end-to-end.
 *
 * @example
 * ```typescript
 * // Importar en otro módulo
 * @Module({
 *   imports: [FinanceModule],
 * })
 * export class OtroModule {}
 * ```
 *
 * @see {@link FinanceService} para la lógica de negocio financiera
 * @see {@link FinanceController} para los endpoints REST expuestos
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEntity,
      PaymentEntity,
      ReferralEntity,
      UserEntity,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
