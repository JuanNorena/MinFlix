import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiClient } from '../shared/api/client'
import { getAuthSession } from '../shared/session/authSession'
import { clearActiveProfile } from '../shared/session/profileSession'
import { buttonClassName } from '../shared/ui/buttonStyles'

// --- Tipos de respuesta de la API ---

interface ConsumptionRow {
  ciudadResidencia: string
  categoria: string
  genero: string | null
  ultimoDispositivo: string | null
  plan: string
  periodoMes: string
  totalReproducciones: number
  perfilesUnicos: number
  promedioAvance: number
}

interface FinanceRow {
  ciudadResidencia: string
  plan: string
  periodoAnio: number
  periodoMes: number
  totalFacturas: number
  ingresosTotales: number
  ingresosCobrados: number
  ingresosPendientes: number
  usuariosFacturados: number
}

interface PerformanceRow {
  departamento: string
  totalEmpleados: number
  totalJefes: number
  empleadosActivos: number
  anioIngreso: number
  mesIngreso: number
}

type ActiveTab = 'consumo' | 'finanzas' | 'rendimiento'

/**
 * Verifica si la sesion tiene privilegios de analitica ejecutiva.
 * @param role - Rol de la sesion autenticada.
 * @returns True para roles admin o analista.
 */
function hasAnalyticsRole(role: string): boolean {
  return role === 'admin' || role === 'analista'
}

/**
 * Formatea un numero como moneda colombiana (COP).
 * @param value - Valor numerico a formatear.
 * @returns Cadena formateada con simbolo y separadores.
 */
function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formatea un objeto Date o string de fecha como mes y ano legible.
 * @param value - Fecha a formatear.
 * @returns Cadena con mes abreviado y ano.
 */
function formatPeriodDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-CO', { month: 'short', year: 'numeric' })
}

/**
 * Dashboard de analitica ejecutiva de MinFlix.
 * Permite a roles admin y analista consultar consumo, finanzas y rendimiento interno.
 */
export function AnalyticsDashboardPage() {
  const navigate = useNavigate()
  const authSession = useMemo(() => getAuthSession(), [])
  const canAccessAnalytics = authSession != null && hasAnalyticsRole(authSession.role)

  const [activeTab, setActiveTab] = useState<ActiveTab>('consumo')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // --- Estado de la pestana Consumo ---
  const [consumptionFilters, setConsumptionFilters] = useState({
    ciudad: '',
    categoria: '',
    genero: '',
    dispositivo: '',
    plan: '',
  })
  const [consumptionData, setConsumptionData] = useState<ConsumptionRow[]>([])
  const [isLoadingConsumption, setIsLoadingConsumption] = useState(false)
  const [consumptionQueried, setConsumptionQueried] = useState(false)

  // --- Estado de la pestana Finanzas ---
  const [financeFilters, setFinanceFilters] = useState({
    ciudad: '',
    plan: '',
    anio: '',
    mes: '',
  })
  const [financeData, setFinanceData] = useState<FinanceRow[]>([])
  const [isLoadingFinance, setIsLoadingFinance] = useState(false)
  const [financeQueried, setFinanceQueried] = useState(false)

  // --- Estado de la pestana Rendimiento ---
  const [performanceFilters, setPerformanceFilters] = useState({
    departamento: '',
    anio: '',
  })
  const [performanceData, setPerformanceData] = useState<PerformanceRow[]>([])
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  const [performanceQueried, setPerformanceQueried] = useState(false)

  if (!authSession) {
    return <Navigate to="/login" replace />
  }

  function handleSignOut() {
    setIsMobileMenuOpen(false)
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchConsumption = useCallback(async () => {
    try {
      setIsLoadingConsumption(true)
      setConsumptionQueried(true)
      const params: Record<string, string> = {}
      if (consumptionFilters.ciudad)     params['ciudad']      = consumptionFilters.ciudad
      if (consumptionFilters.categoria)  params['categoria']   = consumptionFilters.categoria
      if (consumptionFilters.genero)     params['genero']      = consumptionFilters.genero
      if (consumptionFilters.dispositivo) params['dispositivo'] = consumptionFilters.dispositivo
      if (consumptionFilters.plan)       params['plan']        = consumptionFilters.plan

      const response = await apiClient.get<ConsumptionRow[]>('/analytics/consumption', { params })
      setConsumptionData(response.data)
    } catch {
      setConsumptionData([])
      toast.error('No pudimos cargar los datos de consumo.')
    } finally {
      setIsLoadingConsumption(false)
    }
  }, [consumptionFilters])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchFinance = useCallback(async () => {
    try {
      setIsLoadingFinance(true)
      setFinanceQueried(true)
      const params: Record<string, string> = {}
      if (financeFilters.ciudad) params['ciudad'] = financeFilters.ciudad
      if (financeFilters.plan)   params['plan']   = financeFilters.plan
      if (financeFilters.anio)   params['anio']   = financeFilters.anio
      if (financeFilters.mes)    params['mes']    = financeFilters.mes

      const response = await apiClient.get<FinanceRow[]>('/analytics/finance', { params })
      setFinanceData(response.data)
    } catch {
      setFinanceData([])
      toast.error('No pudimos cargar los datos financieros.')
    } finally {
      setIsLoadingFinance(false)
    }
  }, [financeFilters])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPerformance = useCallback(async () => {
    try {
      setIsLoadingPerformance(true)
      setPerformanceQueried(true)
      const params: Record<string, string> = {}
      if (performanceFilters.departamento) params['departamento'] = performanceFilters.departamento
      if (performanceFilters.anio)         params['anio']         = performanceFilters.anio

      const response = await apiClient.get<PerformanceRow[]>('/analytics/internal-performance', { params })
      setPerformanceData(response.data)
    } catch {
      setPerformanceData([])
      toast.error('No pudimos cargar los datos de rendimiento.')
    } finally {
      setIsLoadingPerformance(false)
    }
  }, [performanceFilters])

  return (
    <main className="nf-shell nf-moderation-shell">
      <section className="nf-moderation-container">

        {/* Topbar identica a ReportsModerationPage */}
        <motion.header
          className="nf-moderation-topbar"
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
            aria-controls="analytics-menu"
          >
            <span className="nf-browse-menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{isMobileMenuOpen ? 'Cerrar' : 'Menu'}</span>
          </button>

          <div
            id="analytics-menu"
            className={`nf-detail-topbar-actions nf-topbar-collapsible ${isMobileMenuOpen ? 'is-open' : ''}`}
          >
            <span className="nf-chip">Rol: {authSession.role}</span>
            <Link
              to="/browse"
              className={buttonClassName('ghost')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Ir a catalogo
            </Link>
            <button
              type="button"
              className={buttonClassName('primary')}
              onClick={handleSignOut}
            >
              Cerrar sesion
            </button>
          </div>
        </motion.header>

        {/* Guard de rol: solo admin y analista */}
        {!canAccessAnalytics ? (
          <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
            <h3>Acceso restringido</h3>
            <p>
              Esta seccion es exclusiva para usuarios con rol admin o analista.
            </p>
            <div className="nf-content-tile-actions">
              <Link to="/browse" className={buttonClassName('primary')}>
                Volver al catalogo
              </Link>
            </div>
          </article>
        ) : (
          <>
            {/* Cabecera y selector de pestana */}
            <motion.section
              className="nf-content-detail-report"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.32 }}
            >
              <header className="nf-catalog-row-header">
                <h1 className="nf-browse-section-title">Dashboard de Analitica</h1>
              </header>

              <div className="nf-moderation-filters">
                <label htmlFor="analytics-tab-select" className="nf-rating-label">
                  Vista
                </label>
                <select
                  id="analytics-tab-select"
                  className="nf-input"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as ActiveTab)}
                >
                  <option value="consumo">Consumo de contenido</option>
                  <option value="finanzas">Finanzas e ingresos</option>
                  <option value="rendimiento">Rendimiento interno</option>
                </select>
              </div>
            </motion.section>

            {/* ==================== PESTANA CONSUMO ==================== */}
            {activeTab === 'consumo' && (
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
              >
                <div className="nf-moderation-filters" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                  <label className="nf-rating-label">Ciudad</label>
                  <input
                    className="nf-input"
                    placeholder="Ej: Bogota"
                    value={consumptionFilters.ciudad}
                    onChange={(e) =>
                      setConsumptionFilters((f) => ({ ...f, ciudad: e.target.value }))
                    }
                  />
                  <label className="nf-rating-label">Categoria</label>
                  <input
                    className="nf-input"
                    placeholder="Ej: Peliculas"
                    value={consumptionFilters.categoria}
                    onChange={(e) =>
                      setConsumptionFilters((f) => ({ ...f, categoria: e.target.value }))
                    }
                  />
                  <label className="nf-rating-label">Genero</label>
                  <input
                    className="nf-input"
                    placeholder="Ej: Drama"
                    value={consumptionFilters.genero}
                    onChange={(e) =>
                      setConsumptionFilters((f) => ({ ...f, genero: e.target.value }))
                    }
                  />
                  <label className="nf-rating-label">Dispositivo</label>
                  <select
                    className="nf-input"
                    value={consumptionFilters.dispositivo}
                    onChange={(e) =>
                      setConsumptionFilters((f) => ({ ...f, dispositivo: e.target.value }))
                    }
                  >
                    <option value="">Todos</option>
                    <option value="movil">Movil</option>
                    <option value="tablet">Tablet</option>
                    <option value="tv">TV</option>
                    <option value="computador">Computador</option>
                  </select>
                  <label className="nf-rating-label">Plan</label>
                  <select
                    className="nf-input"
                    value={consumptionFilters.plan}
                    onChange={(e) =>
                      setConsumptionFilters((f) => ({ ...f, plan: e.target.value }))
                    }
                  >
                    <option value="">Todos</option>
                    <option value="BASICO">Basico</option>
                    <option value="ESTANDAR">Estandar</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                  <button
                    type="button"
                    className={buttonClassName('primary')}
                    onClick={() => void fetchConsumption()}
                    disabled={isLoadingConsumption}
                  >
                    {isLoadingConsumption ? 'Consultando...' : 'Consultar'}
                  </button>
                </div>

                {isLoadingConsumption ? (
                  <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                    <h3>Cargando datos de consumo...</h3>
                    <p>Consultando la vista analitica de reproducciones.</p>
                  </article>
                ) : consumptionQueried && consumptionData.length === 0 ? (
                  <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                    <h3>Sin resultados</h3>
                    <p>No hay datos de consumo para los filtros seleccionados.</p>
                  </article>
                ) : consumptionData.length > 0 ? (
                  <section className="nf-moderation-grid">
                    {consumptionData.map((row, index) => (
                      <article key={index} className="nf-moderation-card">
                        <header className="nf-catalog-row-header">
                          <h3>{row.categoria}</h3>
                          <span className="nf-catalog-badge">{row.plan}</span>
                        </header>
                        <p className="nf-moderation-meta">Ciudad: {row.ciudadResidencia}</p>
                        {row.genero ? (
                          <p className="nf-moderation-meta">Genero: {row.genero}</p>
                        ) : null}
                        {row.ultimoDispositivo ? (
                          <p className="nf-moderation-meta">Dispositivo: {row.ultimoDispositivo}</p>
                        ) : null}
                        <p className="nf-moderation-meta">
                          Periodo: {formatPeriodDate(row.periodoMes)}
                        </p>
                        <p className="nf-moderation-meta">
                          Reproducciones: <strong>{row.totalReproducciones}</strong>
                        </p>
                        <p className="nf-moderation-meta">
                          Perfiles unicos: {row.perfilesUnicos}
                        </p>
                        <p className="nf-moderation-meta">
                          Avance promedio: {row.promedioAvance}%
                        </p>
                      </article>
                    ))}
                  </section>
                ) : null}
              </motion.section>
            )}

            {/* ==================== PESTANA FINANZAS ==================== */}
            {activeTab === 'finanzas' && (
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
              >
                <div className="nf-moderation-filters" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                  <label className="nf-rating-label">Ciudad</label>
                  <input
                    className="nf-input"
                    placeholder="Ej: Medellin"
                    value={financeFilters.ciudad}
                    onChange={(e) =>
                      setFinanceFilters((f) => ({ ...f, ciudad: e.target.value }))
                    }
                  />
                  <label className="nf-rating-label">Plan</label>
                  <select
                    className="nf-input"
                    value={financeFilters.plan}
                    onChange={(e) =>
                      setFinanceFilters((f) => ({ ...f, plan: e.target.value }))
                    }
                  >
                    <option value="">Todos</option>
                    <option value="BASICO">Basico</option>
                    <option value="ESTANDAR">Estandar</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                  <label className="nf-rating-label">Ano</label>
                  <input
                    className="nf-input"
                    type="number"
                    placeholder="Ej: 2025"
                    min={2000}
                    max={2200}
                    value={financeFilters.anio}
                    onChange={(e) =>
                      setFinanceFilters((f) => ({ ...f, anio: e.target.value }))
                    }
                  />
                  <label className="nf-rating-label">Mes</label>
                  <select
                    className="nf-input"
                    value={financeFilters.mes}
                    onChange={(e) =>
                      setFinanceFilters((f) => ({ ...f, mes: e.target.value }))
                    }
                  >
                    <option value="">Todos</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={String(m)}>
                        {new Date(2000, m - 1, 1).toLocaleString('es-CO', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={buttonClassName('primary')}
                    onClick={() => void fetchFinance()}
                    disabled={isLoadingFinance}
                  >
                    {isLoadingFinance ? 'Consultando...' : 'Consultar'}
                  </button>
                </div>

                {isLoadingFinance ? (
                  <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                    <h3>Cargando datos financieros...</h3>
                    <p>Consultando la vista analitica de facturacion.</p>
                  </article>
                ) : financeQueried && financeData.length === 0 ? (
                  <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                    <h3>Sin resultados</h3>
                    <p>No hay datos financieros para los filtros seleccionados.</p>
                  </article>
                ) : financeData.length > 0 ? (
                  <section className="nf-moderation-grid">
                    {financeData.map((row, index) => (
                      <article key={index} className="nf-moderation-card">
                        <header className="nf-catalog-row-header">
                          <h3>{row.ciudadResidencia}</h3>
                          <span className="nf-catalog-badge">{row.plan}</span>
                        </header>
                        <p className="nf-moderation-meta">
                          Periodo: {row.periodoMes}/{row.periodoAnio}
                        </p>
                        <p className="nf-moderation-meta">
                          Facturas: {row.totalFacturas} &mdash; Usuarios: {row.usuariosFacturados}
                        </p>
                        <p className="nf-moderation-meta">
                          Ingresos totales: <strong>{formatCOP(row.ingresosTotales)}</strong>
                        </p>
                        <p className="nf-moderation-meta">
                          Cobrado: {formatCOP(row.ingresosCobrados)}
                        </p>
                        <p className="nf-moderation-meta">
                          Pendiente: {formatCOP(row.ingresosPendientes)}
                        </p>
                      </article>
                    ))}
                  </section>
                ) : null}
              </motion.section>
            )}

            {/* ==================== PESTANA RENDIMIENTO ==================== */}
            {activeTab === 'rendimiento' && (
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
              >
                <div className="nf-moderation-filters" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                  <label className="nf-rating-label">Departamento</label>
                  <select
                    className="nf-input"
                    value={performanceFilters.departamento}
                    onChange={(e) =>
                      setPerformanceFilters((f) => ({ ...f, departamento: e.target.value }))
                    }
                  >
                    <option value="">Todos</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Contenido">Contenido</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Soporte">Soporte</option>
                    <option value="Finanzas">Finanzas</option>
                  </select>
                  <label className="nf-rating-label">Ano ingreso</label>
                  <input
                    className="nf-input"
                    type="number"
                    placeholder="Ej: 2024"
                    min={2000}
                    max={2200}
                    value={performanceFilters.anio}
                    onChange={(e) =>
                      setPerformanceFilters((f) => ({ ...f, anio: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className={buttonClassName('primary')}
                    onClick={() => void fetchPerformance()}
                    disabled={isLoadingPerformance}
                  >
                    {isLoadingPerformance ? 'Consultando...' : 'Consultar'}
                  </button>
                </div>

                {isLoadingPerformance ? (
                  <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                    <h3>Cargando datos de rendimiento...</h3>
                    <p>Consultando la vista analitica del equipo interno.</p>
                  </article>
                ) : performanceQueried && performanceData.length === 0 ? (
                  <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                    <h3>Sin resultados</h3>
                    <p>No hay datos de rendimiento para los filtros seleccionados.</p>
                  </article>
                ) : performanceData.length > 0 ? (
                  <section className="nf-moderation-grid">
                    {performanceData.map((row, index) => (
                      <article key={index} className="nf-moderation-card">
                        <header className="nf-catalog-row-header">
                          <h3>{row.departamento}</h3>
                          <span className="nf-catalog-badge">
                            {row.anioIngreso}/{String(row.mesIngreso).padStart(2, '0')}
                          </span>
                        </header>
                        <p className="nf-moderation-meta">
                          Total empleados: <strong>{row.totalEmpleados}</strong>
                        </p>
                        <p className="nf-moderation-meta">
                          Activos: {row.empleadosActivos}
                        </p>
                        <p className="nf-moderation-meta">
                          Jefes: {row.totalJefes}
                        </p>
                      </article>
                    ))}
                  </section>
                ) : null}
              </motion.section>
            )}
          </>
        )}
      </section>
    </main>
  )
}
