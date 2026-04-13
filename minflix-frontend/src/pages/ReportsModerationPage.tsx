import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { apiClient } from '../shared/api/client'
import {
  getAuthSession,
  hasModeratorRole,
} from '../shared/session/authSession'
import { clearActiveProfile } from '../shared/session/profileSession'
import { buttonClassName } from '../shared/ui/buttonStyles'

interface ModerationReportItem {
  idReporte: number
  perfilId: number
  nombrePerfil: string
  contenidoId: number
  tituloContenido: string
  motivo: string
  detalle: string | null
  estadoReporte: string
  moderadorId: number | null
  moderadorEmail: string | null
  resolucion: string | null
  fechaReporte: string
  fechaActualizacion: string
  fechaResolucion: string | null
}

interface ApiErrorResponse {
  message?: string | string[]
}

type ModerationStatusFilter =
  | 'PENDIENTES'
  | 'ABIERTO'
  | 'EN_REVISION'
  | 'RESUELTO'
  | 'DESCARTADO'

function prettifyStatus(status: string): string {
  switch (status) {
    case 'ABIERTO':
      return 'Abierto'
    case 'EN_REVISION':
      return 'En revision'
    case 'RESUELTO':
      return 'Resuelto'
    case 'DESCARTADO':
      return 'Descartado'
    default:
      return status
  }
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Sin fecha'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha'
  }

  return parsedDate.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
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
 * Bandeja de moderacion para gestionar reportes de contenido.
 */
export function ReportsModerationPage() {
  const navigate = useNavigate()
  const authSession = useMemo(() => getAuthSession(), [])
  const canModerate = hasModeratorRole(authSession)

  const [statusFilter, setStatusFilter] =
    useState<ModerationStatusFilter>('PENDIENTES')
  const [reports, setReports] = useState<ModerationReportItem[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true)
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null)
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<number, string>>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const fetchReports = useCallback(
    async (targetFilter: ModerationStatusFilter) => {
      try {
        setIsLoadingReports(true)

        const response = await apiClient.get<ModerationReportItem[]>(
          '/community/reports/moderation',
          {
            params: {
              estado: targetFilter !== 'PENDIENTES' ? targetFilter : undefined,
              limit: 60,
            },
          },
        )

        setReports(response.data)
        setResolutionDrafts((current) => {
          const next = { ...current }

          response.data.forEach((report) => {
            if (next[report.idReporte] === undefined) {
              next[report.idReporte] = report.resolucion ?? ''
            }
          })

          return next
        })
      } catch {
        setReports([])
        toast.error('No pudimos cargar la bandeja de moderacion.')
      } finally {
        setIsLoadingReports(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!canModerate) {
      setIsLoadingReports(false)
      return
    }

    void fetchReports(statusFilter)
  }, [canModerate, fetchReports, statusFilter])

  if (!authSession) {
    return <Navigate to="/login" replace />
  }

  function handleSignOut() {
    setIsMobileMenuOpen(false)
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  async function handleModerationAction(
    report: ModerationReportItem,
    status: 'EN_REVISION' | 'RESUELTO' | 'DESCARTADO',
  ) {
    const resolution = resolutionDrafts[report.idReporte]?.trim() ?? ''

    if ((status === 'RESUELTO' || status === 'DESCARTADO') && resolution.length === 0) {
      toast.error('Debes escribir una resolucion para cerrar el reporte.')
      return
    }

    try {
      setUpdatingReportId(report.idReporte)

      await apiClient.patch(
        `/community/reports/${report.idReporte}/moderation`,
        {
          estado: status,
          resolucion: resolution.length > 0 ? resolution : undefined,
        },
      )

      toast.success(
        status === 'EN_REVISION'
          ? 'Reporte marcado en revision.'
          : 'Reporte actualizado correctamente.',
      )
      await fetchReports(statusFilter)
    } catch (error) {
      toast.error(
        resolveApiErrorMessage(
          error,
          'No pudimos actualizar el estado del reporte.',
        ),
      )
    } finally {
      setUpdatingReportId(null)
    }
  }

  return (
    <main className="nf-shell nf-moderation-shell">
      <section className="nf-moderation-container">
        <motion.header
          className="nf-moderation-topbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="nf-browse-brand">MINFLIX MODERACION</span>

          <button
            type="button"
            className={`nf-browse-menu-toggle ${isMobileMenuOpen ? 'is-open' : ''}`}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="moderation-menu"
          >
            <span className="nf-browse-menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{isMobileMenuOpen ? 'Cerrar' : 'Menu'}</span>
          </button>

          <div
            id="moderation-menu"
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

        {!canModerate ? (
          <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
            <h3>Acceso restringido</h3>
            <p>
              Esta bandeja es exclusiva para usuarios con rol soporte o admin.
            </p>
            <div className="nf-content-tile-actions">
              <Link to="/browse" className={buttonClassName('primary')}>
                Volver al catalogo
              </Link>
            </div>
          </article>
        ) : (
          <>
            <motion.section
              className="nf-content-detail-report"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.32 }}
            >
              <header className="nf-catalog-row-header">
                <h1 className="nf-browse-section-title">Bandeja de reportes</h1>
                <span>{reports.length} casos</span>
              </header>

              <div className="nf-moderation-filters">
                <label htmlFor="moderation-status-filter" className="nf-rating-label">
                  Estado
                </label>
                <select
                  id="moderation-status-filter"
                  className="nf-input"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as ModerationStatusFilter)
                  }
                >
                  <option value="PENDIENTES">Pendientes (abiertos y en revision)</option>
                  <option value="ABIERTO">Abiertos</option>
                  <option value="EN_REVISION">En revision</option>
                  <option value="RESUELTO">Resueltos</option>
                  <option value="DESCARTADO">Descartados</option>
                </select>
              </div>
            </motion.section>

            {isLoadingReports ? (
              <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                <h3>Cargando reportes...</h3>
                <p>Estamos consultando la bandeja de moderacion.</p>
              </article>
            ) : reports.length === 0 ? (
              <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
                <h3>Sin reportes para este filtro</h3>
                <p>No hay casos pendientes de atencion en este estado.</p>
              </article>
            ) : (
              <motion.section
                className="nf-moderation-grid"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.34 }}
              >
                {reports.map((report) => {
                  const draftResolution = resolutionDrafts[report.idReporte] ?? ''
                  const isUpdatingCurrent = updatingReportId === report.idReporte

                  return (
                    <article key={report.idReporte} className="nf-moderation-card">
                      <header className="nf-catalog-row-header">
                        <h3>Reporte #{report.idReporte}</h3>
                        <span className="nf-catalog-badge">
                          {prettifyStatus(report.estadoReporte)}
                        </span>
                      </header>

                      <p className="nf-moderation-meta">
                        Perfil: {report.nombrePerfil} (ID {report.perfilId})
                      </p>
                      <p className="nf-moderation-meta">
                        Contenido: {report.tituloContenido} (ID {report.contenidoId})
                      </p>
                      <p className="nf-moderation-meta">
                        Motivo: {report.motivo}
                      </p>
                      <p className="nf-content-tile-description">
                        {report.detalle ?? 'Sin detalle adicional del usuario.'}
                      </p>
                      <p className="nf-moderation-meta">
                        Creado: {formatDateTime(report.fechaReporte)}
                      </p>
                      <p className="nf-moderation-meta">
                        Actualizado: {formatDateTime(report.fechaActualizacion)}
                      </p>
                      {report.moderadorEmail ? (
                        <p className="nf-moderation-meta">
                          Moderador: {report.moderadorEmail}
                        </p>
                      ) : null}

                      <label
                        htmlFor={`resolution-${report.idReporte}`}
                        className="nf-rating-label"
                      >
                        Resolucion
                      </label>
                      <textarea
                        id={`resolution-${report.idReporte}`}
                        className="nf-input nf-rating-review"
                        rows={3}
                        maxLength={1000}
                        value={draftResolution}
                        onChange={(event) =>
                          setResolutionDrafts((current) => ({
                            ...current,
                            [report.idReporte]: event.target.value,
                          }))
                        }
                        placeholder="Describe la accion tomada para este reporte..."
                        disabled={isUpdatingCurrent}
                      />

                      <div className="nf-moderation-actions">
                        <button
                          type="button"
                          className={buttonClassName('ghost')}
                          onClick={() =>
                            void handleModerationAction(report, 'EN_REVISION')
                          }
                          disabled={isUpdatingCurrent}
                        >
                          {isUpdatingCurrent ? 'Actualizando...' : 'Marcar en revision'}
                        </button>
                        <button
                          type="button"
                          className={buttonClassName('primary')}
                          onClick={() => void handleModerationAction(report, 'RESUELTO')}
                          disabled={isUpdatingCurrent}
                        >
                          {isUpdatingCurrent ? 'Actualizando...' : 'Resolver'}
                        </button>
                        <button
                          type="button"
                          className={buttonClassName('ghost')}
                          onClick={() => void handleModerationAction(report, 'DESCARTADO')}
                          disabled={isUpdatingCurrent}
                        >
                          {isUpdatingCurrent ? 'Actualizando...' : 'Descartar'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </motion.section>
            )}
          </>
        )}
      </section>
    </main>
  )
}
