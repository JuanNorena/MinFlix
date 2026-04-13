import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { apiClient } from '../shared/api/client'
import { getAuthSession, hasModeratorRole } from '../shared/session/authSession'
import { clearActiveProfile } from '../shared/session/profileSession'
import { buttonClassName } from '../shared/ui/buttonStyles'

interface InvoiceItemView {
  idFacturacion: number
  periodoAnio: number
  periodoMes: number
  fechaCorte: string
  fechaVencimiento: string
  montoBase: number
  descuentoReferidosPct: number
  descuentoFidelidadPct: number
  montoFinal: number
  estadoFactura: string
  fechaPago: string | null
}

interface PaymentItemView {
  idPago: number
  idFacturacion: number
  periodoAnio: number
  periodoMes: number
  fechaPago: string
  monto: number
  metodoPago: string
  estadoTransaccion: string
  referenciaPago: string | null
}

interface ReferralItemView {
  idReferido: number
  tipoRelacion: 'REFERENTE' | 'REFERIDO'
  usuarioReferenteEmail: string
  usuarioReferidoEmail: string
  usuarioRelacionadoEmail: string
  estadoReferido: string
  descuentoPct: number
  fechaReferido: string
}

interface FinanceSummaryView {
  usuarioId: number
  email: string
  estadoCuenta: string
  totalFacturas: number
  facturasPendientesOVencidas: number
  totalPagadoExitoso: number
  descuentoReferidosActivoPct: number
  facturaVigente: InvoiceItemView | null
}

interface ApiErrorResponse {
  message?: string | string[]
}

interface CheckoutPaymentResponse {
  mensaje: string
  pago: PaymentItemView
  facturaActualizada: InvoiceItemView
}

type InvoiceStatusFilter = 'TODAS' | 'PENDIENTE' | 'PAGADA' | 'VENCIDA'
type PaymentStatusFilter =
  | 'TODOS'
  | 'PENDIENTE'
  | 'EXITOSO'
  | 'FALLIDO'
  | 'REEMBOLSADO'
type ReferralStatusFilter = 'TODOS' | 'PENDIENTE' | 'VALIDADO' | 'ANULADO'
type ReferralTypeFilter = 'TODOS' | 'REFERENTE' | 'REFERIDO'

function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha'
  }

  return parsedDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function formatDateTime(value: string): string {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha'
  }

  return parsedDate.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCardNumberInput(value: string): string {
  const digitsOnly = value.replace(/\D+/g, '').slice(0, 19)
  return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatExpiryInput(value: string): string {
  const digitsOnly = value.replace(/\D+/g, '').slice(0, 4)

  if (digitsOnly.length <= 2) {
    return digitsOnly
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
}

function formatCvvInput(value: string): string {
  return value.replace(/\D+/g, '').slice(0, 4)
}

function prettifyInvoiceStatus(value: string): string {
  switch (value) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'PAGADA':
      return 'Pagada'
    case 'VENCIDA':
      return 'Vencida'
    default:
      return value
  }
}

function prettifyPaymentStatus(value: string): string {
  switch (value) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'EXITOSO':
      return 'Exitoso'
    case 'FALLIDO':
      return 'Fallido'
    case 'REEMBOLSADO':
      return 'Reembolsado'
    default:
      return value
  }
}

function prettifyReferralStatus(value: string): string {
  switch (value) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'VALIDADO':
      return 'Validado'
    case 'ANULADO':
      return 'Anulado'
    default:
      return value
  }
}

function resolveApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback
  }

  const message = error.response?.data?.message
  if (Array.isArray(message) && message.length > 0) {
    return message[0]
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message
  }

  return fallback
}

/**
 * Vista financiera para consultar estado de cuenta, pagos y referidos.
 */
export function BillingPage() {
  const navigate = useNavigate()
  const authSession = useMemo(() => getAuthSession(), [])
  const canModerateReports = hasModeratorRole(authSession)

  const [summary, setSummary] = useState<FinanceSummaryView | null>(null)
  const [invoices, setInvoices] = useState<InvoiceItemView[]>([])
  const [payments, setPayments] = useState<PaymentItemView[]>([])
  const [referrals, setReferrals] = useState<ReferralItemView[]>([])

  const [invoiceStatusFilter, setInvoiceStatusFilter] =
    useState<InvoiceStatusFilter>('TODAS')
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PaymentStatusFilter>('TODOS')
  const [referralStatusFilter, setReferralStatusFilter] =
    useState<ReferralStatusFilter>('TODOS')
  const [referralTypeFilter, setReferralTypeFilter] =
    useState<ReferralTypeFilter>('TODOS')

  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [checkoutInvoiceId, setCheckoutInvoiceId] = useState<number | null>(null)
  const [checkoutMethod, setCheckoutMethod] =
    useState<'TARJETA_CREDITO' | 'TARJETA_DEBITO'>('TARJETA_CREDITO')
  const [checkoutCardHolder, setCheckoutCardHolder] = useState('')
  const [checkoutCardNumber, setCheckoutCardNumber] = useState('')
  const [checkoutExpiry, setCheckoutExpiry] = useState('')
  const [checkoutCvv, setCheckoutCvv] = useState('')
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false)

  const pendingInvoices = useMemo(() => {
    return invoices.filter((invoice) =>
      invoice.estadoFactura === 'PENDIENTE' || invoice.estadoFactura === 'VENCIDA',
    )
  }, [invoices])

  useEffect(() => {
    if (pendingInvoices.length === 0) {
      setCheckoutInvoiceId(null)
      return
    }

    setCheckoutInvoiceId((current) => {
      if (current && pendingInvoices.some((invoice) => invoice.idFacturacion === current)) {
        return current
      }

      return pendingInvoices[0].idFacturacion
    })
  }, [pendingInvoices])

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoadingSummary(true)
      const response = await apiClient.get<FinanceSummaryView>('/finance/summary')
      setSummary(response.data)
    } catch (error) {
      setSummary(null)
      toast.error(
        resolveApiErrorMessage(
          error,
          'No pudimos cargar el resumen financiero de la cuenta.',
        ),
      )
    } finally {
      setIsLoadingSummary(false)
    }
  }, [])

  const fetchInvoices = useCallback(async (status: InvoiceStatusFilter) => {
    try {
      setIsLoadingInvoices(true)
      const response = await apiClient.get<InvoiceItemView[]>('/finance/invoices', {
        params: {
          estado: status !== 'TODAS' ? status : undefined,
          limit: 12,
        },
      })
      setInvoices(response.data)
    } catch (error) {
      setInvoices([])
      toast.error(
        resolveApiErrorMessage(error, 'No pudimos cargar las facturas.'),
      )
    } finally {
      setIsLoadingInvoices(false)
    }
  }, [])

  const fetchPayments = useCallback(async (status: PaymentStatusFilter) => {
    try {
      setIsLoadingPayments(true)
      const response = await apiClient.get<PaymentItemView[]>('/finance/payments', {
        params: {
          estadoTransaccion: status !== 'TODOS' ? status : undefined,
          limit: 16,
        },
      })
      setPayments(response.data)
    } catch (error) {
      setPayments([])
      toast.error(
        resolveApiErrorMessage(error, 'No pudimos cargar el historial de pagos.'),
      )
    } finally {
      setIsLoadingPayments(false)
    }
  }, [])

  const fetchReferrals = useCallback(
    async (status: ReferralStatusFilter, relation: ReferralTypeFilter) => {
      try {
        setIsLoadingReferrals(true)
        const response = await apiClient.get<ReferralItemView[]>('/finance/referrals', {
          params: {
            estado: status !== 'TODOS' ? status : undefined,
            tipoRelacion: relation !== 'TODOS' ? relation : undefined,
            limit: 20,
          },
        })
        setReferrals(response.data)
      } catch (error) {
        setReferrals([])
        toast.error(
          resolveApiErrorMessage(error, 'No pudimos cargar los referidos.'),
        )
      } finally {
        setIsLoadingReferrals(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!authSession) {
      return
    }

    void fetchSummary()
  }, [authSession, fetchSummary])

  useEffect(() => {
    if (!authSession) {
      return
    }

    void fetchInvoices(invoiceStatusFilter)
  }, [authSession, fetchInvoices, invoiceStatusFilter])

  useEffect(() => {
    if (!authSession) {
      return
    }

    void fetchPayments(paymentStatusFilter)
  }, [authSession, fetchPayments, paymentStatusFilter])

  useEffect(() => {
    if (!authSession) {
      return
    }

    void fetchReferrals(referralStatusFilter, referralTypeFilter)
  }, [
    authSession,
    fetchReferrals,
    referralStatusFilter,
    referralTypeFilter,
  ])

  if (!authSession) {
    return <Navigate to="/login" replace />
  }

  /**
   * Cierra sesion y limpia perfil activo local.
   */
  function handleSignOut() {
    setIsMobileMenuOpen(false)
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  /**
   * Procesa el formulario de pago simulado con tarjeta sin cobro real.
   * @param event - Evento de submit del formulario.
   */
  async function handleCheckoutSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!checkoutInvoiceId) {
      toast.error('No hay factura pendiente seleccionada para pagar.')
      return
    }

    const normalizedCardNumber = checkoutCardNumber.replace(/\s+/g, '')
    const normalizedExpiry = checkoutExpiry.trim()
    const normalizedHolder = checkoutCardHolder.trim()

    if (!/^[0-9]{12,19}$/.test(normalizedCardNumber)) {
      toast.error('Numero de tarjeta invalido. Usa entre 12 y 19 digitos.')
      return
    }

    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(normalizedExpiry)) {
      toast.error('Fecha de expiracion invalida. Usa el formato MM/AA.')
      return
    }

    if (!/^[0-9]{3,4}$/.test(checkoutCvv)) {
      toast.error('CVV invalido. Debe tener 3 o 4 digitos.')
      return
    }

    if (normalizedHolder.length < 3) {
      toast.error('Ingresa el nombre del titular de la tarjeta.')
      return
    }

    try {
      setIsSubmittingCheckout(true)

      const response = await apiClient.post<CheckoutPaymentResponse>(
        '/finance/payments/checkout',
        {
          idFacturacion: checkoutInvoiceId,
          metodoPago: checkoutMethod,
          titularTarjeta: normalizedHolder,
          numeroTarjeta: normalizedCardNumber,
          fechaExpiracion: normalizedExpiry,
          cvv: checkoutCvv,
        },
      )

      toast.success(response.data.mensaje)
      setCheckoutCardNumber('')
      setCheckoutExpiry('')
      setCheckoutCvv('')

      await Promise.all([
        fetchSummary(),
        fetchInvoices(invoiceStatusFilter),
        fetchPayments(paymentStatusFilter),
      ])
    } catch (error) {
      toast.error(
        resolveApiErrorMessage(
          error,
          'No pudimos procesar el pago simulado. Intenta de nuevo.',
        ),
      )
    } finally {
      setIsSubmittingCheckout(false)
    }
  }

  return (
    <main className="nf-shell nf-billing-shell">
      <section className="nf-billing-container">
        <motion.header
          className="nf-billing-topbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="nf-browse-brand">MINFLIX</span>

          <button
            type="button"
            className={`nf-browse-menu-toggle ${isMobileMenuOpen ? 'is-open' : ''}`}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="billing-menu"
          >
            <span className="nf-browse-menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{isMobileMenuOpen ? 'Cerrar' : 'Menu'}</span>
          </button>

          <div
            id="billing-menu"
            className={`nf-detail-topbar-actions nf-topbar-collapsible ${isMobileMenuOpen ? 'is-open' : ''}`}
          >
            <span className="nf-chip">Cuenta: {authSession.email ?? 'sin email'}</span>
            <Link
              to="/browse"
              className={buttonClassName('ghost')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Catalogo
            </Link>
            <Link
              to="/profiles/manage"
              className={buttonClassName('ghost')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Perfiles
            </Link>
            {canModerateReports ? (
              <Link
                to="/moderation/reports"
                className={buttonClassName('ghost')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Moderacion
              </Link>
            ) : null}
            <button
              type="button"
              className={buttonClassName('primary')}
              onClick={handleSignOut}
            >
              Cerrar sesion
            </button>
          </div>
        </motion.header>

        <motion.section
          className="nf-billing-summary-grid"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.32 }}
        >
          <article className="nf-billing-stat-card">
            <p className="nf-billing-stat-label">Estado de cuenta</p>
            {isLoadingSummary ? (
              <p className="nf-billing-stat-value">Cargando...</p>
            ) : (
              <>
                <p className="nf-billing-stat-value">{summary?.estadoCuenta ?? 'Sin datos'}</p>
                <p className="nf-billing-stat-meta">
                  Facturas: {summary?.totalFacturas ?? 0} · Pendientes/Vencidas:{' '}
                  {summary?.facturasPendientesOVencidas ?? 0}
                </p>
              </>
            )}
          </article>

          <article className="nf-billing-stat-card">
            <p className="nf-billing-stat-label">Pagos exitosos acumulados</p>
            <p className="nf-billing-stat-value">
              {formatMoney(summary?.totalPagadoExitoso ?? 0)}
            </p>
            <p className="nf-billing-stat-meta">
              Descuento por referidos activo:{' '}
              {summary?.descuentoReferidosActivoPct ?? 0}%
            </p>
          </article>

          <article className="nf-billing-stat-card">
            <p className="nf-billing-stat-label">Factura vigente</p>
            {summary?.facturaVigente ? (
              <>
                <p className="nf-billing-stat-value">
                  {formatMoney(summary.facturaVigente.montoFinal)}
                </p>
                <p className="nf-billing-stat-meta">
                  Periodo {summary.facturaVigente.periodoAnio}/{summary.facturaVigente.periodoMes}
                </p>
                <p className="nf-billing-stat-meta">
                  Vence: {formatDate(summary.facturaVigente.fechaVencimiento)}
                </p>
              </>
            ) : (
              <p className="nf-billing-stat-value">Sin factura vigente</p>
            )}
          </article>
        </motion.section>

        <motion.section
          className="nf-billing-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.32 }}
        >
          <header className="nf-catalog-row-header">
            <h2 className="nf-browse-section-title">Pagar factura (simulacion)</h2>
            <span>Sin cobro real</span>
          </header>

          <p className="nf-billing-disclaimer">
            Este flujo solicita datos de tarjeta para practicar la experiencia completa de pago,
            pero no se conecta a pasarelas externas ni realiza cobro real.
          </p>

          <form className="nf-billing-checkout-form" onSubmit={handleCheckoutSubmit}>
            <div className="nf-billing-checkout-grid">
              <div>
                <label htmlFor="checkout-invoice" className="nf-rating-label">
                  Factura pendiente
                </label>
                <select
                  id="checkout-invoice"
                  className="nf-input"
                  value={checkoutInvoiceId ?? ''}
                  onChange={(event) => {
                    const nextInvoiceId = event.target.value
                    setCheckoutInvoiceId(nextInvoiceId ? Number(nextInvoiceId) : null)
                  }}
                  disabled={pendingInvoices.length === 0 || isSubmittingCheckout}
                >
                  {pendingInvoices.length === 0 ? (
                    <option value="">Sin facturas pendientes</option>
                  ) : (
                    pendingInvoices.map((invoice) => (
                      <option
                        key={invoice.idFacturacion}
                        value={invoice.idFacturacion}
                      >
                        Factura #{invoice.idFacturacion} - {invoice.periodoAnio}/{invoice.periodoMes} - {formatMoney(invoice.montoFinal)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="checkout-method" className="nf-rating-label">
                  Metodo
                </label>
                <select
                  id="checkout-method"
                  className="nf-input"
                  value={checkoutMethod}
                  onChange={(event) =>
                    setCheckoutMethod(
                      event.target.value as 'TARJETA_CREDITO' | 'TARJETA_DEBITO',
                    )
                  }
                  disabled={isSubmittingCheckout}
                >
                  <option value="TARJETA_CREDITO">Tarjeta credito</option>
                  <option value="TARJETA_DEBITO">Tarjeta debito</option>
                </select>
              </div>

              <div>
                <label htmlFor="checkout-holder" className="nf-rating-label">
                  Titular
                </label>
                <input
                  id="checkout-holder"
                  type="text"
                  className="nf-input"
                  value={checkoutCardHolder}
                  onChange={(event) => setCheckoutCardHolder(event.target.value)}
                  autoComplete="cc-name"
                  disabled={isSubmittingCheckout}
                  required
                />
              </div>

              <div>
                <label htmlFor="checkout-card-number" className="nf-rating-label">
                  Numero de tarjeta
                </label>
                <input
                  id="checkout-card-number"
                  type="text"
                  className="nf-input"
                  value={checkoutCardNumber}
                  onChange={(event) =>
                    setCheckoutCardNumber(formatCardNumberInput(event.target.value))
                  }
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={23}
                  placeholder="4111111111111111"
                  disabled={isSubmittingCheckout}
                  required
                />
              </div>

              <div>
                <label htmlFor="checkout-expiry" className="nf-rating-label">
                  Expiracion (MM/AA)
                </label>
                <input
                  id="checkout-expiry"
                  type="text"
                  className="nf-input"
                  value={checkoutExpiry}
                  onChange={(event) =>
                    setCheckoutExpiry(formatExpiryInput(event.target.value))
                  }
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  placeholder="11/29"
                  disabled={isSubmittingCheckout}
                  required
                />
              </div>

              <div>
                <label htmlFor="checkout-cvv" className="nf-rating-label">
                  CVV
                </label>
                <input
                  id="checkout-cvv"
                  type="password"
                  className="nf-input"
                  value={checkoutCvv}
                  onChange={(event) => setCheckoutCvv(formatCvvInput(event.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  placeholder="123"
                  disabled={isSubmittingCheckout}
                  required
                />
              </div>
            </div>

            <div className="nf-content-tile-actions nf-billing-checkout-actions">
              <button
                type="submit"
                className={buttonClassName('primary')}
                disabled={pendingInvoices.length === 0 || isSubmittingCheckout}
              >
                {isSubmittingCheckout ? 'Procesando pago simulado...' : 'Pagar ahora'}
              </button>
            </div>
          </form>
        </motion.section>

        <motion.section
          className="nf-billing-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.32 }}
        >
          <header className="nf-catalog-row-header">
            <h2 className="nf-browse-section-title">Facturas</h2>
            <span>{invoices.length} registros</span>
          </header>

          <div className="nf-billing-filters">
            <label htmlFor="billing-invoice-status" className="nf-rating-label">
              Estado
            </label>
            <select
              id="billing-invoice-status"
              className="nf-input"
              value={invoiceStatusFilter}
              onChange={(event) =>
                setInvoiceStatusFilter(event.target.value as InvoiceStatusFilter)
              }
            >
              <option value="TODAS">Todas</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="PAGADA">Pagadas</option>
              <option value="VENCIDA">Vencidas</option>
            </select>
          </div>

          {isLoadingInvoices ? (
            <article className="nf-feature-card">
              <h3>Cargando facturas...</h3>
              <p>Estamos consolidando el estado de facturacion.</p>
            </article>
          ) : invoices.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Sin facturas para este filtro</h3>
              <p>No encontramos periodos de facturacion para la consulta actual.</p>
            </article>
          ) : (
            <div className="nf-billing-list">
              {invoices.map((invoice) => (
                <article key={invoice.idFacturacion} className="nf-billing-item">
                  <header className="nf-catalog-row-header">
                    <h3>Factura #{invoice.idFacturacion}</h3>
                    <span className="nf-catalog-badge">
                      {prettifyInvoiceStatus(invoice.estadoFactura)}
                    </span>
                  </header>

                  <div className="nf-billing-item-grid">
                    <p className="nf-billing-item-meta">
                      Periodo: {invoice.periodoAnio}/{invoice.periodoMes}
                    </p>
                    <p className="nf-billing-item-meta">
                      Corte: {formatDate(invoice.fechaCorte)}
                    </p>
                    <p className="nf-billing-item-meta">
                      Vence: {formatDate(invoice.fechaVencimiento)}
                    </p>
                    <p className="nf-billing-item-meta">
                      Base: {formatMoney(invoice.montoBase)}
                    </p>
                    <p className="nf-billing-item-meta">
                      Desc. referidos: {invoice.descuentoReferidosPct}%
                    </p>
                    <p className="nf-billing-item-meta">
                      Desc. fidelidad: {invoice.descuentoFidelidadPct}%
                    </p>
                  </div>

                  <p className="nf-billing-highlight">
                    Total final: {formatMoney(invoice.montoFinal)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className="nf-billing-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11, duration: 0.32 }}
        >
          <header className="nf-catalog-row-header">
            <h2 className="nf-browse-section-title">Pagos</h2>
            <span>{payments.length} transacciones</span>
          </header>

          <div className="nf-billing-filters">
            <label htmlFor="billing-payment-status" className="nf-rating-label">
              Estado de transaccion
            </label>
            <select
              id="billing-payment-status"
              className="nf-input"
              value={paymentStatusFilter}
              onChange={(event) =>
                setPaymentStatusFilter(event.target.value as PaymentStatusFilter)
              }
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EXITOSO">Exitosos</option>
              <option value="FALLIDO">Fallidos</option>
              <option value="REEMBOLSADO">Reembolsados</option>
            </select>
          </div>

          {isLoadingPayments ? (
            <article className="nf-feature-card">
              <h3>Cargando pagos...</h3>
              <p>Estamos consultando tus transacciones registradas.</p>
            </article>
          ) : payments.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Sin pagos para este filtro</h3>
              <p>Ajusta el filtro para revisar otras transacciones.</p>
            </article>
          ) : (
            <div className="nf-billing-list">
              {payments.map((payment) => (
                <article key={payment.idPago} className="nf-billing-item">
                  <header className="nf-catalog-row-header">
                    <h3>Pago #{payment.idPago}</h3>
                    <span className="nf-catalog-badge">
                      {prettifyPaymentStatus(payment.estadoTransaccion)}
                    </span>
                  </header>

                  <div className="nf-billing-item-grid">
                    <p className="nf-billing-item-meta">
                      Factura: #{payment.idFacturacion}
                    </p>
                    <p className="nf-billing-item-meta">
                      Periodo: {payment.periodoAnio}/{payment.periodoMes}
                    </p>
                    <p className="nf-billing-item-meta">
                      Metodo: {payment.metodoPago}
                    </p>
                    <p className="nf-billing-item-meta">
                      Fecha: {formatDateTime(payment.fechaPago)}
                    </p>
                    <p className="nf-billing-item-meta">
                      Referencia: {payment.referenciaPago ?? 'No disponible'}
                    </p>
                  </div>

                  <p className="nf-billing-highlight">
                    Monto: {formatMoney(payment.monto)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className="nf-billing-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.32 }}
        >
          <header className="nf-catalog-row-header">
            <h2 className="nf-browse-section-title">Referidos</h2>
            <span>{referrals.length} relaciones</span>
          </header>

          <div className="nf-billing-filters nf-billing-filters-double">
            <div>
              <label htmlFor="billing-referral-status" className="nf-rating-label">
                Estado
              </label>
              <select
                id="billing-referral-status"
                className="nf-input"
                value={referralStatusFilter}
                onChange={(event) =>
                  setReferralStatusFilter(event.target.value as ReferralStatusFilter)
                }
              >
                <option value="TODOS">Todos</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="VALIDADO">Validados</option>
                <option value="ANULADO">Anulados</option>
              </select>
            </div>

            <div>
              <label htmlFor="billing-referral-relation" className="nf-rating-label">
                Relacion
              </label>
              <select
                id="billing-referral-relation"
                className="nf-input"
                value={referralTypeFilter}
                onChange={(event) =>
                  setReferralTypeFilter(event.target.value as ReferralTypeFilter)
                }
              >
                <option value="TODOS">Todas</option>
                <option value="REFERENTE">Soy referente</option>
                <option value="REFERIDO">Soy referido</option>
              </select>
            </div>
          </div>

          {isLoadingReferrals ? (
            <article className="nf-feature-card">
              <h3>Cargando referidos...</h3>
              <p>Estamos revisando tus relaciones de referido activas.</p>
            </article>
          ) : referrals.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Sin referidos para este filtro</h3>
              <p>Invita a alguien y veras su avance reflejado aqui.</p>
            </article>
          ) : (
            <div className="nf-billing-list">
              {referrals.map((referral) => (
                <article key={referral.idReferido} className="nf-billing-item">
                  <header className="nf-catalog-row-header">
                    <h3>Referido #{referral.idReferido}</h3>
                    <span className="nf-catalog-badge">
                      {prettifyReferralStatus(referral.estadoReferido)}
                    </span>
                  </header>

                  <div className="nf-billing-item-grid">
                    <p className="nf-billing-item-meta">
                      Tipo: {referral.tipoRelacion === 'REFERENTE' ? 'Referente' : 'Referido'}
                    </p>
                    <p className="nf-billing-item-meta">
                      Referente: {referral.usuarioReferenteEmail}
                    </p>
                    <p className="nf-billing-item-meta">
                      Referido: {referral.usuarioReferidoEmail}
                    </p>
                    <p className="nf-billing-item-meta">
                      Cuenta relacionada: {referral.usuarioRelacionadoEmail}
                    </p>
                    <p className="nf-billing-item-meta">
                      Fecha: {formatDateTime(referral.fechaReferido)}
                    </p>
                  </div>

                  <p className="nf-billing-highlight">
                    Descuento otorgado: {referral.descuentoPct}%
                  </p>
                </article>
              ))}
            </div>
          )}
        </motion.section>
      </section>
    </main>
  )
}
