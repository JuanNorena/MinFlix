import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
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

interface ContinueWatchingItem {
  idReproduccion: number
  perfilId: number
  contenidoId: number
  titulo: string
  clasificacionEdad: string
  tipoContenido: string
  progresoSegundos: number
  duracionTotalSegundos: number | null
  porcentajeAvance: number
  ultimoDispositivo: string | null
  estadoReproduccion: string
  fechaUltimoEvento: string
}

interface PlaybackHistoryItem {
  idReproduccion: number
  perfilId: number
  contenidoId: number
  titulo: string
  tipoContenido: string
  clasificacionEdad: string
  progresoSegundos: number
  duracionTotalSegundos: number | null
  porcentajeAvance: number
  ultimoDispositivo: string | null
  estadoReproduccion: string
  fechaInicio: string
  fechaUltimoEvento: string
  fechaFin: string | null
}

interface FavoriteItem {
  idFavorito: number
  perfilId: number
  contenidoId: number
  titulo: string
  tipoContenido: string
  clasificacionEdad: string
  categoria: CatalogCategory
  fechaAdicion: string
}

type ContentTypeFilter = 'todos' | 'pelicula' | 'serie' | 'documental' | 'musica' | 'podcast'
type ClassificationFilter = 'todas' | 'TP' | '+7' | '+13' | '+16' | '+18'

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

function prettifyPlaybackState(state: string): string {
  switch (state) {
    case 'EN_PROGRESO':
      return 'En progreso'
    case 'PAUSADO':
      return 'Pausado'
    case 'FINALIZADO':
      return 'Finalizado'
    default:
      return state
  }
}

function formatHistoryDate(value: string): string {
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
 * Vista interna posterior a la seleccion de perfil.
 */
export function BrowsePage() {
  const navigate = useNavigate()
  const activeProfile = getActiveProfile()
  const activeProfileId = activeProfile?.id ?? null
  const authSession = useMemo(() => getAuthSession(), [])
  const canModerateReports = hasModeratorRole(authSession)
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [contents, setContents] = useState<CatalogContent[]>([])
  const [continueWatchingItems, setContinueWatchingItems] =
    useState<ContinueWatchingItem[]>([])
  const [playbackHistoryItems, setPlaybackHistoryItems] =
    useState<PlaybackHistoryItem[]>([])
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([])
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)
  const [isLoadingContinueWatching, setIsLoadingContinueWatching] = useState(true)
  const [isLoadingPlaybackHistory, setIsLoadingPlaybackHistory] = useState(true)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)
  const [playbackLoadingContentId, setPlaybackLoadingContentId] =
    useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<ContentTypeFilter>('todos')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('todas')
  const [selectedClassification, setSelectedClassification] =
    useState<ClassificationFilter>('todas')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const avatarUrl = useMemo(
    () => resolveAvatarUrl(activeProfile?.avatar ?? null),
    [activeProfile],
  )

  const featuredContent = useMemo(() => {
    return contents[0] ?? null
  }, [contents])

  const groupedContentsByCategory = useMemo(() => {
    const groupedMap = new Map<
      number,
      { category: CatalogCategory; items: CatalogContent[] }
    >()

    categories.forEach((category) => {
      groupedMap.set(category.id, {
        category,
        items: [],
      })
    })

    contents.forEach((content) => {
      const existingGroup = groupedMap.get(content.categoria.id)
      if (existingGroup) {
        existingGroup.items.push(content)
        return
      }

      groupedMap.set(content.categoria.id, {
        category: content.categoria,
        items: [content],
      })
    })

    return Array.from(groupedMap.values()).filter((group) => group.items.length > 0)
  }, [categories, contents])

  useEffect(() => {
    if (!activeProfileId) {
      return
    }

    void fetchCatalog({
      type: 'todos',
      categoryId: 'todas',
      classification: 'todas',
    })
    void fetchContinueWatching(activeProfileId)
    void fetchPlaybackHistory(activeProfileId)
    void fetchFavorites(activeProfileId)
  }, [activeProfileId])

  if (!activeProfile) {
    return <Navigate to="/profiles/select" replace />
  }

  /**
   * Cierra sesion y limpia contexto de perfil activo.
   */
  function handleSignOut() {
    setIsMobileMenuOpen(false)
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  /**
   * Consulta categorias y contenidos base del catalogo con filtros.
   * @param filters - Criterios de filtrado para el listado de contenidos.
   */
  async function fetchCatalog(filters: {
    type: ContentTypeFilter
    categoryId: string
    classification: ClassificationFilter
  }) {
    try {
      setIsLoadingCatalog(true)

      const [categoriesResponse, contentsResponse] = await Promise.all([
        apiClient.get<CatalogCategory[]>('/catalog/categories'),
        apiClient.get<CatalogContent[]>('/catalog/contents', {
          params: {
            tipoContenido: filters.type !== 'todos' ? filters.type : undefined,
            categoriaId:
              filters.categoryId !== 'todas' ? Number(filters.categoryId) : undefined,
            clasificacionEdad:
              filters.classification !== 'todas'
                ? filters.classification
                : undefined,
            limit: 30,
          },
        }),
      ])

      setCategories(categoriesResponse.data)
      setContents(contentsResponse.data)
    } catch {
      toast.error('No pudimos cargar el catalogo. Intenta de nuevo en unos segundos.')
    } finally {
      setIsLoadingCatalog(false)
    }
  }

  /**
   * Carga la fila de continuar viendo para el perfil activo.
   * @param profileId - Identificador del perfil activo.
   */
  async function fetchContinueWatching(profileId: number) {
    try {
      setIsLoadingContinueWatching(true)

      const continueWatchingResponse = await apiClient.get<ContinueWatchingItem[]>(
        '/playback/continue-watching',
        {
          params: {
            perfilId: profileId,
            limit: 12,
          },
        },
      )

      setContinueWatchingItems(continueWatchingResponse.data)
    } catch {
      setContinueWatchingItems([])
    } finally {
      setIsLoadingContinueWatching(false)
    }
  }

  /**
   * Carga el historial reciente de reproduccion del perfil activo.
   * @param profileId - Identificador del perfil activo.
   */
  async function fetchPlaybackHistory(profileId: number) {
    try {
      setIsLoadingPlaybackHistory(true)

      const playbackHistoryResponse = await apiClient.get<PlaybackHistoryItem[]>(
        '/playback/history',
        {
          params: {
            perfilId: profileId,
            limit: 10,
          },
        },
      )

      setPlaybackHistoryItems(playbackHistoryResponse.data)
    } catch {
      setPlaybackHistoryItems([])
    } finally {
      setIsLoadingPlaybackHistory(false)
    }
  }

  /**
   * Carga la lista de favoritos para el perfil activo.
   * @param profileId - Identificador del perfil activo.
   */
  async function fetchFavorites(profileId: number) {
    try {
      setIsLoadingFavorites(true)

      const favoritesResponse = await apiClient.get<FavoriteItem[]>(
        '/community/favorites',
        {
          params: {
            perfilId: profileId,
            limit: 12,
          },
        },
      )

      setFavoriteItems(favoritesResponse.data)
    } catch {
      setFavoriteItems([])
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  /**
   * Registra inicio de reproduccion para un contenido del catalogo.
   * @param content - Contenido seleccionado para reproducir.
   */
  async function handleStartPlayback(content: CatalogContent) {
    if (!activeProfile) {
      return
    }

    try {
      setPlaybackLoadingContentId(content.id)

      await apiClient.post('/playback/start', {
        perfilId: activeProfile.id,
        contenidoId: content.id,
        duracionTotalSegundos: content.duracionMinutos
          ? content.duracionMinutos * 60
          : undefined,
        ultimoDispositivo: 'Web',
      })

      toast.success(`Listo, continua con "${content.titulo}".`)
      await Promise.all([
        fetchContinueWatching(activeProfile.id),
        fetchPlaybackHistory(activeProfile.id),
      ])
    } catch {
      toast.error('No pudimos iniciar la reproduccion. Intenta de nuevo.')
    } finally {
      setPlaybackLoadingContentId(null)
    }
  }

  /**
   * Reanuda reproduccion desde la fila de continuar viendo.
   * @param item - Contenido previamente iniciado por el perfil.
   */
  async function handleResumePlayback(item: ContinueWatchingItem) {
    if (!activeProfile) {
      return
    }

    try {
      setPlaybackLoadingContentId(item.contenidoId)

      await apiClient.post('/playback/progress', {
        perfilId: activeProfile.id,
        contenidoId: item.contenidoId,
        progresoSegundos: item.progresoSegundos,
        duracionTotalSegundos: item.duracionTotalSegundos ?? undefined,
        ultimoDispositivo: 'Web',
        estadoReproduccion: 'EN_PROGRESO',
      })

      toast.success(`Retomando "${item.titulo}".`)
      await Promise.all([
        fetchContinueWatching(activeProfile.id),
        fetchPlaybackHistory(activeProfile.id),
      ])
    } catch {
      toast.error('No pudimos reanudar la reproduccion. Intenta de nuevo.')
    } finally {
      setPlaybackLoadingContentId(null)
    }
  }

  /**
   * Aplica los filtros seleccionados por el usuario sobre el catalogo.
   */
  function handleApplyFilters() {
    void fetchCatalog({
      type: selectedType,
      categoryId: selectedCategoryId,
      classification: selectedClassification,
    })
  }

  /**
   * Reinicia filtros a estado base y refresca el listado.
   */
  function handleClearFilters() {
    setSelectedType('todos')
    setSelectedCategoryId('todas')
    setSelectedClassification('todas')

    void fetchCatalog({
      type: 'todos',
      categoryId: 'todas',
      classification: 'todas',
    })
  }

  /**
   * Abre la vista de detalle para el contenido seleccionado.
   * @param contentId - Identificador del contenido.
   */
  function openContentDetail(contentId: number) {
    navigate(`/browse/content/${contentId}`)
  }

  /**
   * Accesibilidad por teclado para tarjetas clicables.
   * @param event - Evento de teclado.
   * @param contentId - Identificador del contenido destino.
   */
  function handleTileKeyDown(
    event: React.KeyboardEvent<HTMLElement>,
    contentId: number,
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openContentDetail(contentId)
    }
  }

  return (
    <main className="nf-shell nf-browse-shell">
      <section className="nf-browse-container">
        <motion.header
          className="nf-browse-topbar"
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
            aria-controls="browse-menu"
          >
            <span className="nf-browse-menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{isMobileMenuOpen ? 'Cerrar' : 'Menu'}</span>
          </button>

          <div
            id="browse-menu"
            className={`nf-browse-topbar-actions ${isMobileMenuOpen ? 'is-open' : ''}`}
          >
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

            <Link
              to="/profiles/select"
              className={buttonClassName('ghost')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cambiar perfil
            </Link>
            <Link
              to="/profiles/manage"
              className={buttonClassName('ghost')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Administrar
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
          className="nf-browse-hero-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.35 }}
        >
          {featuredContent ? (
            <>
              <p className="nf-chip">{featuredContent.esExclusivo ? 'MinFlix Original' : 'Destacado de hoy'}</p>
              <h1 className="nf-browse-hero-title">{featuredContent.titulo}</h1>
              <p className="nf-browse-hero-meta">
                {featuredContent.categoria.nombre}
                {featuredContent.anioLanzamiento
                  ? ` · ${featuredContent.anioLanzamiento}`
                  : ''}
                {featuredContent.duracionMinutos
                  ? ` · ${featuredContent.duracionMinutos} min`
                  : ''}
              </p>
              <p className="nf-browse-hero-description">
                {featuredContent.sinopsis ??
                  'Una gran historia te espera aqui.'}
              </p>
              <div className="nf-catalog-badges">
                <span className="nf-catalog-badge">
                  {prettifyContentType(featuredContent.tipoContenido)}
                </span>
                <span className="nf-catalog-badge">{featuredContent.clasificacionEdad}</span>
                {featuredContent.esExclusivo ? (
                  <span className="nf-catalog-badge nf-catalog-badge-exclusive">
                    Original
                  </span>
                ) : null}
              </div>
              <div className="nf-browse-hero-actions">
                <button
                  type="button"
                  className={buttonClassName('primary')}
                  onClick={() => void handleStartPlayback(featuredContent)}
                  disabled={playbackLoadingContentId === featuredContent.id}
                >
                  {playbackLoadingContentId === featuredContent.id
                    ? 'Iniciando...'
                    : 'Reproducir'}
                </button>
                <button
                  type="button"
                  className={buttonClassName('ghost')}
                  onClick={() => openContentDetail(featuredContent.id)}
                >
                  Ver detalles
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="nf-chip">Perfil activo</p>
              <h1 className="nf-browse-hero-title">Hola, {activeProfile.nombre}</h1>
              <p className="nf-browse-hero-description">
                Descubre una nueva historia para ver esta noche.
              </p>
            </>
          )}
        </motion.section>

        <motion.section
          className="nf-browse-continue-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.33 }}
        >
          <header className="nf-catalog-row-header">
            <h2 className="nf-browse-section-title">Continua viendo</h2>
            <span>{continueWatchingItems.length} titulos</span>
          </header>

          {isLoadingContinueWatching ? (
            <article className="nf-feature-card">
              <h3>Cargando continuidad...</h3>
              <p>Estamos buscando tus reproducciones recientes.</p>
            </article>
          ) : continueWatchingItems.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Aun no hay avances guardados</h3>
              <p>Empieza un titulo y aparecera aqui para retomarlo rapido.</p>
            </article>
          ) : (
            <div className="nf-catalog-row-track">
              {continueWatchingItems.map((item) => (
                <article
                  key={item.idReproduccion}
                  className="nf-content-tile nf-content-tile-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openContentDetail(item.contenidoId)}
                  onKeyDown={(event) => handleTileKeyDown(event, item.contenidoId)}
                >
                  <h4>{item.titulo}</h4>
                  <div className="nf-catalog-badges">
                    <span className="nf-catalog-badge">
                      {prettifyContentType(item.tipoContenido)}
                    </span>
                    <span className="nf-catalog-badge">{item.clasificacionEdad}</span>
                    <span className="nf-catalog-badge">{Math.round(item.porcentajeAvance)}%</span>
                  </div>
                  <p className="nf-catalog-meta">
                    {item.ultimoDispositivo
                      ? `Ultimo dispositivo: ${item.ultimoDispositivo}`
                      : 'Dispositivo no especificado'}
                  </p>
                  <div className="nf-progress-track" aria-hidden="true">
                    <span
                      className="nf-progress-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(item.porcentajeAvance)),
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="nf-content-tile-actions">
                    <button
                      type="button"
                      className={buttonClassName('primary')}
                      onClick={(event) => {
                        event.stopPropagation()
                        void handleResumePlayback(item)
                      }}
                      disabled={playbackLoadingContentId === item.contenidoId}
                    >
                      {playbackLoadingContentId === item.contenidoId
                        ? 'Abriendo...'
                        : 'Seguir viendo'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className="nf-browse-favorites-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.105, duration: 0.33 }}
        >
          <header className="nf-catalog-row-header">
            <h2 className="nf-browse-section-title">Mi lista</h2>
            <span>{favoriteItems.length} favoritos</span>
          </header>

          {isLoadingFavorites ? (
            <article className="nf-feature-card">
              <h3>Cargando favoritos...</h3>
              <p>Estamos recuperando tu lista personal.</p>
            </article>
          ) : favoriteItems.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Tu lista esta vacia</h3>
              <p>Agrega titulos desde detalle para verlos aqui.</p>
            </article>
          ) : (
            <div className="nf-catalog-row-track">
              {favoriteItems.map((item) => (
                <article
                  key={item.idFavorito}
                  className="nf-content-tile nf-content-tile-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openContentDetail(item.contenidoId)}
                  onKeyDown={(event) => handleTileKeyDown(event, item.contenidoId)}
                >
                  <h4>{item.titulo}</h4>
                  <div className="nf-catalog-badges">
                    <span className="nf-catalog-badge">
                      {prettifyContentType(item.tipoContenido)}
                    </span>
                    <span className="nf-catalog-badge">{item.clasificacionEdad}</span>
                    <span className="nf-catalog-badge">{item.categoria.nombre}</span>
                  </div>
                  <p className="nf-catalog-meta">
                    Agregado: {formatHistoryDate(item.fechaAdicion)}
                  </p>
                  <div className="nf-content-tile-actions">
                    <button
                      type="button"
                      className={buttonClassName('ghost')}
                      onClick={(event) => {
                        event.stopPropagation()
                        openContentDetail(item.contenidoId)
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

        <motion.section
          className="nf-browse-history-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11, duration: 0.33 }}
        >
          <header className="nf-catalog-row-header">
            <h2 className="nf-browse-section-title">Actividad reciente</h2>
            <span>{playbackHistoryItems.length} eventos</span>
          </header>

          {isLoadingPlaybackHistory ? (
            <article className="nf-feature-card">
              <h3>Cargando historial...</h3>
              <p>Estamos recuperando tus eventos recientes.</p>
            </article>
          ) : playbackHistoryItems.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Sin historial reciente</h3>
              <p>Cuando inicies reproducciones, apareceran aqui.</p>
            </article>
          ) : (
            <div className="nf-history-grid">
              {playbackHistoryItems.map((item) => (
                <article
                  key={item.idReproduccion}
                  className="nf-content-tile nf-content-tile-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openContentDetail(item.contenidoId)}
                  onKeyDown={(event) => handleTileKeyDown(event, item.contenidoId)}
                >
                  <h4>{item.titulo}</h4>
                  <div className="nf-catalog-badges">
                    <span className="nf-catalog-badge">
                      {prettifyContentType(item.tipoContenido)}
                    </span>
                    <span className="nf-catalog-badge">{item.clasificacionEdad}</span>
                    <span className="nf-catalog-badge">
                      {prettifyPlaybackState(item.estadoReproduccion)}
                    </span>
                  </div>
                  <p className="nf-catalog-meta">
                    Ultimo evento: {formatHistoryDate(item.fechaUltimoEvento)}
                  </p>
                  <p className="nf-history-time">
                    {item.ultimoDispositivo
                      ? `Dispositivo: ${item.ultimoDispositivo}`
                      : 'Dispositivo: no especificado'}
                  </p>
                  <div className="nf-progress-track" aria-hidden="true">
                    <span
                      className="nf-progress-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, item.porcentajeAvance))}%`,
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          className="nf-browse-filter-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          <h2 className="nf-browse-section-title">Explora por categoria</h2>

          <div className="nf-catalog-filters">
            <select
              className="nf-input"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value as ContentTypeFilter)
              }
            >
              <option value="todos">Tipo: Todos</option>
              <option value="pelicula">Pelicula</option>
              <option value="serie">Serie</option>
              <option value="documental">Documental</option>
              <option value="musica">Musica</option>
              <option value="podcast">Podcast</option>
            </select>

            <select
              className="nf-input"
              value={selectedClassification}
              onChange={(event) =>
                setSelectedClassification(event.target.value as ClassificationFilter)
              }
            >
              <option value="todas">Clasificacion: Todas</option>
              <option value="TP">TP</option>
              <option value="+7">+7</option>
              <option value="+13">+13</option>
              <option value="+16">+16</option>
              <option value="+18">+18</option>
            </select>

            <select
              className="nf-input"
              value={selectedCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
            >
              <option value="todas">Categoria: Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.nombre}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={buttonClassName('primary')}
              onClick={handleApplyFilters}
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              className={buttonClassName('ghost')}
              onClick={handleClearFilters}
            >
              Limpiar
            </button>
          </div>
        </motion.section>

        <motion.section
          className="nf-browse-catalog"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
        >
          {isLoadingCatalog ? (
            <article className="nf-feature-card">
              <h3>Cargando titulos...</h3>
              <p>Estamos preparando recomendaciones para ti.</p>
            </article>
          ) : groupedContentsByCategory.length === 0 ? (
            <article className="nf-feature-card">
              <h3>Sin resultados</h3>
              <p>Prueba otros filtros para descubrir mas contenido.</p>
            </article>
          ) : (
            groupedContentsByCategory.map((group) => (
              <section key={group.category.id} className="nf-catalog-row">
                <header className="nf-catalog-row-header">
                  <h3>{group.category.nombre}</h3>
                  <span>{group.items.length} titulos</span>
                </header>

                <div className="nf-catalog-row-track">
                  {group.items.map((content) => (
                    <article
                      key={content.id}
                      className="nf-content-tile nf-content-tile-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => openContentDetail(content.id)}
                      onKeyDown={(event) => handleTileKeyDown(event, content.id)}
                    >
                      <h4>{content.titulo}</h4>
                      <div className="nf-catalog-badges">
                        <span className="nf-catalog-badge">
                          {prettifyContentType(content.tipoContenido)}
                        </span>
                        <span className="nf-catalog-badge">
                          {content.clasificacionEdad}
                        </span>
                        {content.esExclusivo ? (
                          <span className="nf-catalog-badge nf-catalog-badge-exclusive">
                            Original
                          </span>
                        ) : null}
                      </div>
                      <p className="nf-catalog-meta">
                        {content.anioLanzamiento
                          ? `${content.anioLanzamiento}`
                          : 'Sin anio'}
                        {content.duracionMinutos
                          ? ` · ${content.duracionMinutos} min`
                          : ''}
                      </p>
                      <p className="nf-content-tile-description">
                        {content.sinopsis ??
                          'Sin descripcion disponible por ahora.'}
                      </p>
                      <div className="nf-content-tile-actions">
                        <button
                          type="button"
                          className={buttonClassName('ghost')}
                          onClick={(event) => {
                            event.stopPropagation()
                            void handleStartPlayback(content)
                          }}
                          disabled={playbackLoadingContentId === content.id}
                        >
                          {playbackLoadingContentId === content.id
                            ? 'Abriendo...'
                            : 'Ver ahora'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </motion.section>
      </section>
    </main>
  )
}
