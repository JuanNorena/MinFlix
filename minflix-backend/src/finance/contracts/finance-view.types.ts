/**
 * Vista de una factura individual para respuestas de API financiera.
 */
export interface InvoiceItemView {
  idFacturacion: number;
  periodoAnio: number;
  periodoMes: number;
  fechaCorte: Date;
  fechaVencimiento: Date;
  montoBase: number;
  descuentoReferidosPct: number;
  descuentoFidelidadPct: number;
  montoFinal: number;
  estadoFactura: string;
  fechaPago: Date | null;
}

/**
 * Vista de una transaccion de pago para respuestas de API financiera.
 */
export interface PaymentItemView {
  idPago: number;
  idFacturacion: number;
  periodoAnio: number;
  periodoMes: number;
  fechaPago: Date;
  monto: number;
  metodoPago: string;
  estadoTransaccion: string;
  referenciaPago: string | null;
}

/**
 * Vista de un vinculo de referido asociado al usuario autenticado.
 */
export interface ReferralItemView {
  idReferido: number;
  tipoRelacion: 'REFERENTE' | 'REFERIDO';
  usuarioReferenteEmail: string;
  usuarioReferidoEmail: string;
  usuarioRelacionadoEmail: string;
  estadoReferido: string;
  descuentoPct: number;
  fechaReferido: Date;
}

/**
 * Vista agregada del estado financiero de la cuenta autenticada.
 */
export interface FinanceSummaryView {
  usuarioId: number;
  email: string;
  estadoCuenta: string;
  totalFacturas: number;
  facturasPendientesOVencidas: number;
  totalPagadoExitoso: number;
  descuentoReferidosActivoPct: number;
  facturaVigente: InvoiceItemView | null;
}

/**
 * Resultado de un pago simulado ejecutado desde la UI de facturacion.
 */
export interface MockCheckoutPaymentView {
  mensaje: string;
  pago: PaymentItemView;
  facturaActualizada: InvoiceItemView;
}
