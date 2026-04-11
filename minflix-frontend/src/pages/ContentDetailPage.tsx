import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { apiClient } from '../shared/api/client'
import { profileInitials, resolveAvatarUrl } from '../shared/helpers/avatarUrl'
import {
  clearActiveProfile,
  getActiveProfile,
} from '../shared/session/profileSession'
import {
  getAuthSession,
  hasModeratorRole,
} from '../shared/session/authSession'
import { buttonClassName } from '../shared/ui/buttonStyles'

interface CatalogCategory {
  id: number
  nombre: string
  descripcion: string | null
}

interface CatalogContent {
  id: number
  titulo: string
  tipoContenido: string
  anioLanzamiento: number | null
  duracionMinutos: number | null
  sinopsis: string | null
  clasificacionEdad: string
  esExclusivo: boolean
  categoria: CatalogCategory
}

interface FavoriteStatusResponse {
  perfilId: number
  contenidoId: number
  esFavorito: boolean
}

interface RatingStatusResponse {
  perfilId: number
  contenidoId: number
  tieneCalificacion: boolean
  puntaje: number | null
  resena: string | null
}

interface ApiErrorResponse {
  message?: string | string[]
}

interface ReportItemResponse {
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

const REPORT_MOTIVE_OPTIONS = [
  { value: 'INAPROPIADO', label: 'Inapropiado' },
  { value: 'VIOLENCIA', label: 'Violencia explicita' },
  { value: 'DERECHOS_AUTOR', label: 'Derechos de autor' },
  { value: 'DESINFORMACION', label: 'Desinformacion' },
  { value: 'SPAM', label: 'Spam o fraude' },
  { value: 'OTRO', label: 'Otro motivo' },
] as const

function prettifyContentType(type: string): string {
  switch (type) {
    case 'pelicula':
      return 'Pelicula'
    case 'serie':
      return 'Serie'
    case 'documental':
      return 'Documental'
    case 'musica':
      return 'Musica'
    case 'podcast':
      return 'Podcast'
    default:
      return type
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

function prettifyReportStatus(status: string): string {
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

function formatReportDate(value: string): string {
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

/**
 * Pantalla de detalle de contenido para navegacion tipo streaming.
 */
export function ContentDetailPage() {
  const navigate = useNavigate()
  const { contentId } = useParams<{ contentId: string }>()
  const activeProfile = getActiveProfile()
  const authSession = useMemo(() => getAuthSession(), [])
  const canModerateReports = hasModeratorRole(authSession)
  const activeProfileId = activeProfile?.id ?? null
  const numericContentId = Number(contentId)
  const isContentIdValid = Number.isInteger(numericContentId) && numericContentId > 0

  const [content, setContent] = useState<CatalogContent | null>(null)
  const [relatedContents, setRelatedContents] = useState<CatalogContent[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)
  const [isStartingPlayback, setIsStartingPlayback] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isCheckingFavoriteStatus, setIsCheckingFavoriteStatus] = useState(true)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [hasRating, setHasRating] = useState(false)
  const [ratingScore, setRatingScore] = useState(5)
  const [ratingReview, setRatingReview] = useState('')
  const [isCheckingRatingStatus, setIsCheckingRatingStatus] = useState(true)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [isRemovingRating, setIsRemovingRating] = useState(false)
  const [selectedReportMotive, setSelectedReportMotive] =
    useState<(typeof REPORT_MOTIVE_OPTIONS)[number]['value']>('INAPROPIADO')
  const [reportDetail, setReportDetail] = useState('')
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [isLoadingRecentReports, setIsLoadingRecentReports] = useState(true)
  const [recentReports, setRecentReports] = useState<ReportItemResponse[]>([])

  const avatarUrl = useMemo(
    () => resolveAvatarUrl(activeProfile?.avatar ?? null),
    [activeProfile],
  )

  /**
   * Carga contenidos relacionados para reforzar exploracion del catalogo.
   * @param sourceContent - Contenido base de la pantalla actual.
   */
  const fetchRelatedContents = useCallback(async (sourceContent: CatalogContent) => {
    try {
      setIsLoadingRelated(true)

      const response = await apiClient.get<CatalogContent[]>('/catalog/contents', {
        params: {
          categoriaId: sourceContent.categoria.id,
          limit: 18,
        },
      })

      const filteredRelated = response.data
        .filter((item) => item.id !== sourceContent.id)
        .slice(0, 8)

      setRelatedContents(filteredRelated)
    } catch {
      setRelatedContents([])
    } finally {
      setIsLoadingRelated(false)
    }
  }, [])

  /**
   * Consulta si el contenido actual ya esta en favoritos del perfil.
   * @param targetContentId - Contenido evaluado.
   */
  const fetchFavoriteStatus = useCallback(
    async (targetContentId: number) => {
      if (!activeProfileId) {
        setIsFavorite(false)
        setIsCheckingFavoriteStatus(false)
        return
      }

      try {
        setIsCheckingFavoriteStatus(true)

        const response = await apiClient.get<FavoriteStatusResponse>(
          '/community/favorites/status',
          {
            params: {
              perfilId: activeProfileId,
              contenidoId: targetContentId,
            },
          },
        )

        setIsFavorite(response.data.esFavorito)
      } catch {
        setIsFavorite(false)
      } finally {
        setIsCheckingFavoriteStatus(false)
      }
    },
    [activeProfileId],
  )

  /**
   * Consulta si el perfil activo ya califico el contenido actual.
   * @param targetContentId - Contenido evaluado.
   */
  const fetchRatingStatus = useCallback(
    async (targetContentId: number) => {
      if (!activeProfileId) {
        setHasRating(false)
        setRatingScore(5)
        setRatingReview('')
        setIsCheckingRatingStatus(false)
        return
      }

      try {
        setIsCheckingRatingStatus(true)

        const response = await apiClient.get<RatingStatusResponse>(
          '/community/ratings/status',
          {
            params: {
              perfilId: activeProfileId,
              contenidoId: targetContentId,
            },
          },
        )

        if (response.data.tieneCalificacion) {
          setHasRating(true)
          setRatingScore(response.data.puntaje ?? 5)
          setRatingReview(response.data.resena ?? '')
          return
        }

        setHasRating(false)
        setRatingScore(5)
        setRatingReview('')
      } catch {
        setHasRating(false)
        setRatingScore(5)
        setRatingReview('')
      } finally {
        setIsCheckingRatingStatus(false)
      }
    },
    [activeProfileId],
  )

  /**
   * Carga reportes recientes del perfil activo para el contenido actual.
   * @param targetContentId - Contenido evaluado.
   */
  const fetchRecentReports = useCallback(
    async (targetContentId: number) => {
      if (!activeProfileId) {
        setRecentReports([])
        setIsLoadingRecentReports(false)
        return
      }

      try {
        setIsLoadingRecentReports(true)

        const response = await apiClient.get<ReportItemResponse[]>('/community/reports', {
          params: {
            perfilId: activeProfileId,
            limit: 25,
          },
        })

        setRecentReports(
          response.data
            .filter((item) => item.contenidoId === targetContentId)
            .slice(0, 4),
        )
      } catch {
        setRecentReports([])
      } finally {
        setIsLoadingRecentReports(false)
      }
    },
    [activeProfileId],
  )

  /**
   * Consulta detalle de contenido por id y dispara carga de relacionados.
   * @param targetContentId - Contenido a consultar.
   */
  const fetchContentDetail = useCallback(
    async (targetContentId: number) => {
      try {
        setIsLoadingContent(true)

        const response = await apiClient.get<CatalogContent>(
          `/catalog/contents/${targetContentId}`,
        )

        setContent(response.data)
        await Promise.all([
          fetchRelatedContents(response.data),
          fetchFavoriteStatus(response.data.id),
          fetchRatingStatus(response.data.id),
          fetchRecentReports(response.data.id),
        ])
      } catch {
        setContent(null)
        setRelatedContents([])
        setIsFavorite(false)
        setIsCheckingFavoriteStatus(false)
        setHasRating(false)
        setRatingScore(5)
        setRatingReview('')
        setIsCheckingRatingStatus(false)
        setRecentReports([])
        setIsLoadingRecentReports(false)
        toast.error('No pudimos cargar este titulo. Intenta de nuevo.')
      } finally {
        setIsLoadingContent(false)
      }
    },
    [
      fetchFavoriteStatus,
      fetchRatingStatus,
      fetchRecentReports,
      fetchRelatedContents,
    ],
  )

  useEffect(() => {
    if (!isContentIdValid) {
      setContent(null)
      setRelatedContents([])
      setIsLoadingContent(false)
      setIsLoadingRelated(false)
      setIsFavorite(false)
      setIsCheckingFavoriteStatus(false)
      setHasRating(false)
      setRatingScore(5)
      setRatingReview('')
      setIsCheckingRatingStatus(false)
      setRecentReports([])
      setIsLoadingRecentReports(false)
      return
    }

    void fetchContentDetail(numericContentId)
  }, [numericContentId, isContentIdValid, fetchContentDetail])

  if (!activeProfile) {
    return <Navigate to="/profiles/select" replace />
  }

  /**
   * Cierra sesion y limpia contexto de perfil activo.
   */
  function handleSignOut() {
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  /**
   * Navega al detalle de otro contenido relacionado.
   * @param nextContentId - Identificador del contenido destino.
   */
  function openRelatedDetail(nextContentId: number) {
    navigate(`/browse/content/${nextContentId}`)
  }

  /**
   * Accesibilidad por teclado para tarjetas clicables.
   * @param event - Evento de teclado del elemento.
   * @param nextContentId - Identificador del contenido destino.
   */
  function handleTileKeyDown(
    event: React.KeyboardEvent<HTMLElement>,
    nextContentId: number,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openRelatedDetail(nextContentId)
    }
  }

  /**
   * Registra inicio de reproduccion desde la vista de detalle.
   */
  async function handleStartPlayback() {
    if (!content || !activeProfile) {
      return
    }

    try {
      setIsStartingPlayback(true)

      await apiClient.post('/playback/start', {
        perfilId: activeProfile.id,
        contenidoId: content.id,
        duracionTotalSegundos: content.duracionMinutos
          ? content.duracionMinutos * 60
          : undefined,
        ultimoDispositivo: 'Web',
      })

      toast.success(`Reproduccion iniciada para "${content.titulo}".`)
      navigate('/browse')
    } catch {
      toast.error('No pudimos iniciar la reproduccion. Intenta de nuevo.')
    } finally {
      setIsStartingPlayback(false)
    }
  }

  /**
   * Agrega o elimina el contenido actual de favoritos del perfil activo.
   */
  async function handleToggleFavorite() {
    if (!content || !activeProfileId) {
      return
    }

    try {
      setIsTogglingFavorite(true)

      if (isFavorite) {
        await apiClient.delete(`/community/favorites/${content.id}`, {
          params: {
            perfilId: activeProfileId,
          },
        })

        setIsFavorite(false)
        toast.success(`"${content.titulo}" se elimino de tu lista.`)
        return
      }

      await apiClient.post('/community/favorites', {
        perfilId: activeProfileId,
        contenidoId: content.id,
      })

      setIsFavorite(true)
      toast.success(`"${content.titulo}" se agrego a tu lista.`)
    } catch {
      toast.error('No pudimos actualizar tu lista de favoritos. Intenta de nuevo.')
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  /**
   * Crea o actualiza la calificacion del perfil activo.
   */
  async function handleSubmitRating() {
    if (!content || !activeProfileId) {
      return
    }

    const normalizedReview = ratingReview.trim()
    const shouldShowUpdateMessage = hasRating

    try {
      setIsSubmittingRating(true)

      await apiClient.post('/community/ratings', {
        perfilId: activeProfileId,
        contenidoId: content.id,
        puntaje: ratingScore,
        resena: normalizedReview.length > 0 ? normalizedReview : undefined,
      })

      setHasRating(true)
      setRatingReview(normalizedReview)
      toast.success(
        shouldShowUpdateMessage
          ? `Actualizaste tu calificacion para "${content.titulo}".`
          : `Calificaste "${content.titulo}" exitosamente.`,
      )
    } catch (error) {
      toast.error(
        resolveApiErrorMessage(
          error,
          'No pudimos guardar tu calificacion. Intenta de nuevo.',
        ),
      )
    } finally {
      setIsSubmittingRating(false)
    }
  }

  /**
   * Elimina la calificacion del contenido para el perfil activo.
   */
  async function handleRemoveRating() {
    if (!content || !activeProfileId || !hasRating) {
      return
    }

    try {
      setIsRemovingRating(true)

      await apiClient.delete(`/community/ratings/${content.id}`, {
        params: {
          perfilId: activeProfileId,
        },
      })

      setHasRating(false)
      setRatingScore(5)
      setRatingReview('')
      toast.success(`Quitaste tu calificacion para "${content.titulo}".`)
    } catch {
      toast.error('No pudimos eliminar tu calificacion. Intenta de nuevo.')
    } finally {
      setIsRemovingRating(false)
    }
  }

  /**
   * Registra reporte del contenido actual para el perfil activo.
   */
  async function handleSubmitReport() {
    if (!content || !activeProfileId) {
      return
    }

    const normalizedDetail = reportDetail.trim()

    try {
      setIsSubmittingReport(true)

      await apiClient.post('/community/reports', {
        perfilId: activeProfileId,
        contenidoId: content.id,
        motivo: selectedReportMotive,
        detalle: normalizedDetail.length > 0 ? normalizedDetail : undefined,
      })

      setReportDetail('')
      toast.success('Reporte enviado correctamente para revision del equipo.')
      await fetchRecentReports(content.id)
    } catch (error) {
      toast.error(
        resolveApiErrorMessage(
          error,
          'No pudimos registrar tu reporte. Intenta de nuevo.',
        ),
      )
    } finally {
      setIsSubmittingReport(false)
    }
  }

  return (
    <main className="nf-shell nf-content-detail-shell">
      <section className="nf-content-detail-container">
        <motion.header
          className="nf-detail-topbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            className="nf-detail-brand-button"
            onClick={() => navigate('/browse')}
          >
            MINFLIX
          </button>

          <div className="nf-detail-topbar-actions">
            <span className="nf-browse-profile-pill">
              <span className="nf-browse-avatar">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Avatar de ${activeProfile.nombre}`}
                    className="nf-browse-avatar-image"
                  />
                ) : (
                  <span>{profileInitials(activeProfile.nombre)}</span>
                )}
              </span>
              <span className="nf-browse-profile-name">{activeProfile.nombre}</span>
            </span>

            <button
              type="button"
              className={buttonClassName('ghost')}
              onClick={() => navigate('/browse')}
            >
              Volver al catalogo
            </button>
            <Link to="/profiles/select" className={buttonClassName('ghost')}>
              Cambiar perfil
            </Link>
            {canModerateReports ? (
              <Link to="/moderation/reports" className={buttonClassName('ghost')}>
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

        {isLoadingContent ? (
          <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
            <h3>Cargando detalle...</h3>
            <p>Estamos preparando informacion del titulo seleccionado.</p>
          </article>
        ) : !content ? (
          <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
            <h3>No encontramos este titulo</h3>
            <p>Puede que no este disponible por ahora o ya no exista.</p>
            <div className="nf-content-tile-actions">
              <button
                type="button"
                className={buttonClassName('primary')}
                onClick={() => navigate('/browse')}
              >
                Volver al catalogo
              </button>
            </div>
          </article>
        ) : (
          <>
            <motion.section
              className="nf-content-detail-hero"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.32 }}
            >
              <p className="nf-chip">
                {content.esExclusivo ? 'MinFlix Original' : 'Detalle del titulo'}
              </p>
              <h1 className="nf-content-detail-title">{content.titulo}</h1>
              <p className="nf-content-detail-meta">
                {content.categoria.nombre}
                {content.anioLanzamiento ? ` · ${content.anioLanzamiento}` : ''}
                {content.duracionMinutos ? ` · ${content.duracionMinutos} min` : ''}
              </p>
              <p className="nf-content-detail-description">
                {content.sinopsis ??
                  'Este titulo aun no tiene una descripcion publicada.'}
              </p>
              <div className="nf-catalog-badges">
                <span className="nf-catalog-badge">
                  {prettifyContentType(content.tipoContenido)}
                </span>
                <span className="nf-catalog-badge">{content.clasificacionEdad}</span>
                {content.esExclusivo ? (
                  <span className="nf-catalog-badge nf-catalog-badge-exclusive">
                    Original
                  </span>
                ) : null}
              </div>
              <div className="nf-content-detail-actions">
                <button
                  type="button"
                  className={buttonClassName('primary')}
                  onClick={() => void handleStartPlayback()}
                  disabled={isStartingPlayback}
                >
                  {isStartingPlayback ? 'Iniciando...' : 'Reproducir ahora'}
                </button>
                <button
                  type="button"
                  className={buttonClassName('ghost')}
                  onClick={() => void handleToggleFavorite()}
                  disabled={isCheckingFavoriteStatus || isTogglingFavorite}
                >
                  {isCheckingFavoriteStatus
                    ? 'Cargando favorito...'
                    : isTogglingFavorite
                      ? isFavorite
                        ? 'Quitando...'
                        : 'Guardando...'
                      : isFavorite
                        ? 'Quitar de mi lista'
                        : 'Agregar a mi lista'}
                </button>
                <button
                  type="button"
                  className={buttonClassName('ghost')}
                  onClick={() => navigate('/browse')}
                >
                  Explorar mas titulos
                </button>
              </div>
            </motion.section>

            <motion.section
              className="nf-content-detail-rating"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.32 }}
            >
              <header className="nf-catalog-row-header">
                <h2 className="nf-browse-section-title">Tu calificacion</h2>
                <span>
                  {hasRating ? 'Ya calificaste este titulo' : 'Aun sin calificar'}
                </span>
              </header>

              {isCheckingRatingStatus ? (
                <article className="nf-feature-card">
                  <h3>Cargando calificacion...</h3>
                  <p>Estamos consultando tu puntaje y reseña para este titulo.</p>
                </article>
              ) : (
                <article className="nf-content-detail-rating-card">
                  <p className="nf-rating-helper">
                    Para calificar debes haber visto al menos el 50% del contenido.
                  </p>

                  <div
                    className="nf-rating-stars"
                    role="radiogroup"
                    aria-label="Seleccionar puntaje de 1 a 5"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`nf-rating-star ${value <= ratingScore ? 'is-active' : ''}`}
                        onClick={() => setRatingScore(value)}
                        disabled={isSubmittingRating || isRemovingRating}
                        aria-pressed={value === ratingScore}
                      >
                        {value <= ratingScore ? '★' : '☆'}
                      </button>
                    ))}
                  </div>

                  <p className="nf-rating-selected">{ratingScore} de 5 estrellas</p>

                  <label htmlFor="rating-review" className="nf-rating-label">
                    Reseña (opcional)
                  </label>
                  <textarea
                    id="rating-review"
                    className="nf-input nf-rating-review"
                    rows={4}
                    maxLength={1000}
                    value={ratingReview}
                    onChange={(event) => setRatingReview(event.target.value)}
                    placeholder="Comparte brevemente que te parecio este titulo..."
                    disabled={isSubmittingRating || isRemovingRating}
                  />
                  <p className="nf-rating-counter">{ratingReview.length}/1000 caracteres</p>

                  <div className="nf-content-detail-actions nf-rating-actions">
                    <button
                      type="button"
                      className={buttonClassName('primary')}
                      onClick={() => void handleSubmitRating()}
                      disabled={isSubmittingRating || isRemovingRating}
                    >
                      {isSubmittingRating
                        ? hasRating
                          ? 'Actualizando...'
                          : 'Guardando...'
                        : hasRating
                          ? 'Actualizar calificacion'
                          : 'Guardar calificacion'}
                    </button>

                    <button
                      type="button"
                      className={buttonClassName('ghost')}
                      onClick={() => void handleRemoveRating()}
                      disabled={isRemovingRating || isSubmittingRating || !hasRating}
                    >
                      {isRemovingRating ? 'Eliminando...' : 'Quitar calificacion'}
                    </button>
                  </div>
                </article>
              )}
            </motion.section>

            <motion.section
              className="nf-content-detail-report"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.32 }}
            >
              <header className="nf-catalog-row-header">
                <h2 className="nf-browse-section-title">Reportar contenido</h2>
                <span>{recentReports.length} reportes recientes</span>
              </header>

              <article className="nf-content-detail-rating-card">
                <p className="nf-rating-helper">
                  Si detectas contenido inapropiado, describe el caso para que
                  soporte lo revise.
                </p>

                <label htmlFor="report-motive" className="nf-rating-label">
                  Motivo del reporte
                </label>
                <select
                  id="report-motive"
                  className="nf-input"
                  value={selectedReportMotive}
                  onChange={(event) =>
                    setSelectedReportMotive(
                      event.target.value as (typeof REPORT_MOTIVE_OPTIONS)[number]['value'],
                    )
                  }
                  disabled={isSubmittingReport}
                >
                  {REPORT_MOTIVE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <label htmlFor="report-detail" className="nf-rating-label">
                  Detalle (opcional)
                </label>
                <textarea
                  id="report-detail"
                  className="nf-input nf-rating-review"
                  rows={4}
                  maxLength={1000}
                  value={reportDetail}
                  onChange={(event) => setReportDetail(event.target.value)}
                  placeholder="Describe que observaste para apoyar la moderacion..."
                  disabled={isSubmittingReport}
                />
                <p className="nf-rating-counter">{reportDetail.length}/1000 caracteres</p>

                <div className="nf-content-detail-actions nf-rating-actions">
                  <button
                    type="button"
                    className={buttonClassName('primary')}
                    onClick={() => void handleSubmitReport()}
                    disabled={isSubmittingReport}
                  >
                    {isSubmittingReport ? 'Enviando reporte...' : 'Enviar reporte'}
                  </button>
                </div>
              </article>

              {isLoadingRecentReports ? (
                <article className="nf-feature-card" style={{ marginTop: '0.9rem' }}>
                  <h3>Cargando reportes previos...</h3>
                  <p>Estamos consultando tu historial reciente para este titulo.</p>
                </article>
              ) : recentReports.length === 0 ? (
                <article className="nf-feature-card" style={{ marginTop: '0.9rem' }}>
                  <h3>Sin reportes previos en este titulo</h3>
                  <p>
                    Cuando registres un reporte, su estado de moderacion aparecera aqui.
                  </p>
                </article>
              ) : (
                <ul className="nf-report-recent-list">
                  {recentReports.map((report) => (
                    <li key={report.idReporte} className="nf-report-recent-item">
                      <header className="nf-catalog-row-header">
                        <h3>Reporte #{report.idReporte}</h3>
                        <span className="nf-catalog-badge">
                          {prettifyReportStatus(report.estadoReporte)}
                        </span>
                      </header>
                      <p className="nf-catalog-meta">Motivo: {report.motivo}</p>
                      <p className="nf-content-tile-description">
                        {report.detalle ?? 'Sin detalle adicional.'}
                      </p>
                      <p className="nf-catalog-meta">
                        Ultima actualizacion: {formatReportDate(report.fechaActualizacion)}
                      </p>
                      {report.resolucion ? (
                        <p className="nf-catalog-meta">
                          Resolucion: {report.resolucion}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>

            <motion.section
              className="nf-content-detail-related"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.11, duration: 0.34 }}
            >
              <header className="nf-catalog-row-header">
                <h2 className="nf-browse-section-title">Titulos relacionados</h2>
                <span>{relatedContents.length} recomendaciones</span>
              </header>

              {isLoadingRelated ? (
                <article className="nf-feature-card">
                  <h3>Cargando recomendaciones...</h3>
                  <p>Buscando mas opciones similares para ti.</p>
                </article>
              ) : relatedContents.length === 0 ? (
                <article className="nf-feature-card">
                  <h3>Sin recomendaciones por ahora</h3>
                  <p>Pronto agregaremos mas titulos en esta categoria.</p>
                </article>
              ) : (
                <div className="nf-content-detail-grid">
                  {relatedContents.map((item) => (
                    <article
                      key={item.id}
                      className="nf-content-tile nf-content-tile-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => openRelatedDetail(item.id)}
                      onKeyDown={(event) => handleTileKeyDown(event, item.id)}
                    >
                      <h4>{item.titulo}</h4>
                      <div className="nf-catalog-badges">
                        <span className="nf-catalog-badge">
                          {prettifyContentType(item.tipoContenido)}
                        </span>
                        <span className="nf-catalog-badge">{item.clasificacionEdad}</span>
                      </div>
                      <p className="nf-catalog-meta">
                        {item.anioLanzamiento ? `${item.anioLanzamiento}` : 'Sin anio'}
                        {item.duracionMinutos ? ` · ${item.duracionMinutos} min` : ''}
                      </p>
                      <p className="nf-content-tile-description">
                        {item.sinopsis ?? 'Sin descripcion disponible por ahora.'}
                      </p>
                      <div className="nf-content-tile-actions">
                        <button
                          type="button"
                          className={buttonClassName('ghost')}
                          onClick={(event) => {
                            event.stopPropagation()
                            openRelatedDetail(item.id)
                          }}
                        >
                          Ver detalle
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </motion.section>
          </>
        )}
      </section>
    </main>
  )
}
