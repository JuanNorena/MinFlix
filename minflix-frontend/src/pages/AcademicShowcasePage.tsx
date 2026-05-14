/**
 * Página de demostración académica de los núcleos temáticos NT1..NT4.
 *
 * Permite a roles admin y analista ejecutar consultas de solo lectura
 * contra el diccionario de datos de Oracle y las vistas/funciones académicas,
 * visualizando el SQL y los resultados directamente desde la aplicación.
 */

// --------------------------------------------------------------------------
// Importaciones de React y librerías de UI
// --------------------------------------------------------------------------

/** Hooks de React para estado, efectos y memorización */
import { useCallback, useMemo, useState } from 'react'

/** Componente de animación de Framer Motion */
import { motion } from 'framer-motion'

/** Componentes de navegación y enrutamiento de React Router */
import { Link, Navigate, useNavigate } from 'react-router-dom'

/** Notificaciones toast para retroalimentación al usuario */
import { toast } from 'react-hot-toast'

// --------------------------------------------------------------------------
// Importaciones de utilidades compartidas
// --------------------------------------------------------------------------

/** Cliente HTTP para consumir la API del backend */
import { apiClient } from '../shared/api/client'

/** Helper para obtener la sesión de autenticación activa */
import { getAuthSession } from '../shared/session/authSession'

/** Helper para limpiar el perfil activo al cerrar sesión */
import { clearActiveProfile } from '../shared/session/profileSession'

/** Helper para obtener clases CSS de botones */
import { buttonClassName } from '../shared/ui/buttonStyles'

type ActiveTab = 'nt1' | 'nt2' | 'nt3' | 'nt4'

interface ParamField {
  name: string
  label: string
  type: 'number' | 'text'
  defaultValue: string | number
}

interface QuerySection {
  id: string
  title: string
  description: string
  sql: string
  endpoint: string | null
  method?: 'get'
  paramFields?: ParamField[]
}

function hasAnalyticsRole(role: string): boolean {
  return role === 'admin' || role === 'analista'
}

function formatSQL(sql: string): string {
  return sql.trim()
}

const NT1_SECTIONS: QuerySection[] = [
  {
    id: 'nt1-partitions',
    title: 'Fragmentación — Particiones de REPRODUCCIONES',
    description:
      'Muestra las particiones creadas por rango de FECHA_INICIO en la tabla REPRODUCCIONES.',
    sql: `SELECT TABLE_NAME, PARTITION_NAME, HIGH_VALUE, PARTITION_POSITION
FROM USER_TAB_PARTITIONS
WHERE TABLE_NAME = 'REPRODUCCIONES'
ORDER BY PARTITION_POSITION`,
    endpoint: '/showcase/nt1/partitions',
  },
  {
    id: 'nt1-mviews',
    title: 'Vistas Materializadas',
    description:
      'Lista las vistas materializadas MV_CALIFICACIONES_PROMEDIO y MV_METRICAS_FINANCIERAS con su fecha de último refresh.',
    sql: `SELECT MVIEW_NAME, LAST_REFRESH_DATE, STALENESS
FROM USER_MVIEWS
WHERE MVIEW_NAME IN ('MV_CALIFICACIONES_PROMEDIO', 'MV_METRICAS_FINANCIERAS')`,
    endpoint: '/showcase/nt1/materialized-views',
  },
  {
    id: 'nt1-pivot',
    title: 'PIVOT — Reproducciones por dispositivo y mes',
    description:
      'Convierte filas de reproducciones en una matriz bidimensional: dispositivos como filas y meses como columnas.',
    sql: `SELECT * FROM (
  SELECT NVL(ULTIMO_DISPOSITIVO,'Sin dispositivo') AS DISPOSITIVO,
         EXTRACT(MONTH FROM FECHA_INICIO) AS MES,
         ID_REPRODUCCION
  FROM REPRODUCCIONES
)
PIVOT (
  COUNT(ID_REPRODUCCION)
  FOR MES IN (1 AS MES_1, 2 AS MES_2, ..., 12 AS MES_12)
)
ORDER BY DISPOSITIVO`,
    endpoint: '/showcase/nt1/pivot-sample',
  },
  {
    id: 'nt1-rollup',
    title: 'ROLLUP — Ingresos por año y mes con subtotales',
    description:
      'Genera subtotales jerárquicos: total por año, subtotal por mes y gran total.',
    sql: `SELECT PERIODO_ANIO, PERIODO_MES,
       SUM(MONTO_FINAL) AS INGRESOS_TOTALES,
       COUNT(ID_FACTURACION) AS TOTAL_FACTURAS
FROM FACTURACIONES
GROUP BY ROLLUP(PERIODO_ANIO, PERIODO_MES)
ORDER BY PERIODO_ANIO NULLS LAST, PERIODO_MES NULLS LAST`,
    endpoint: '/showcase/nt1/rollup-sample',
  },
]

const NT2_SECTIONS: QuerySection[] = [
  {
    id: 'nt2-cartera',
    title: 'Cursor — Cartera vencida (>30 días)',
    description:
      'Emula el cursor explícito de cartera vencida: facturas pendientes con más de 30 días de vencimiento.',
    sql: `SELECT F.ID_FACTURACION, U.NOMBRE, U.EMAIL,
       F.PERIODO_ANIO, F.PERIODO_MES, F.MONTO_FINAL,
       F.FECHA_VENCIMIENTO,
       TRUNC(SYSDATE) - F.FECHA_VENCIMIENTO AS DIAS_VENCIDA
FROM FACTURACIONES F
JOIN USUARIOS U ON U.ID_USUARIO = F.ID_USUARIO
WHERE F.ESTADO_FACTURA = 'PENDIENTE'
  AND F.FECHA_VENCIMIENTO < TRUNC(SYSDATE) - 30
ORDER BY DIAS_VENCIDA DESC
FETCH FIRST 20 ROWS ONLY`,
    endpoint: '/showcase/nt2/cartera-vencida',
  },
  {
    id: 'nt2-fn-monto',
    title: 'Función — FN_CALCULAR_MONTO',
    description:
      'Ejecuta la función que calcula el monto final con descuentos por referidos y fidelidad.',
    sql: `SELECT FN_CALCULAR_MONTO(:userId, :year, :month) AS MONTO_FINAL FROM DUAL`,
    endpoint: '/showcase/nt2/function-monto',
    paramFields: [
      { name: 'userId', label: 'ID Usuario', type: 'number', defaultValue: 1 },
      { name: 'year', label: 'Año', type: 'number', defaultValue: 2025 },
      { name: 'month', label: 'Mes', type: 'number', defaultValue: 5 },
    ],
  },
  {
    id: 'nt2-fn-recommendation',
    title: 'Función — FN_CONTENIDO_RECOMENDADO',
    description:
      'Ejecuta la función de recomendación de contenido basada en géneros de favoritos del perfil.',
    sql: `SELECT FN_CONTENIDO_RECOMENDADO(:profileId) AS ID_CONTENIDO FROM DUAL`,
    endpoint: '/showcase/nt2/function-recommendation',
    paramFields: [
      { name: 'profileId', label: 'ID Perfil', type: 'number', defaultValue: 1 },
    ],
  },
  {
    id: 'nt2-triggers',
    title: 'Triggers del esquema MINFLIX',
    description:
      'Lista todos los triggers activos del esquema con su tabla, tipo y evento asociado.',
    sql: `SELECT TRIGGER_NAME, TABLE_NAME, TRIGGER_TYPE, TRIGGERING_EVENT, STATUS
FROM USER_TRIGGERS
WHERE TABLE_NAME IN ('USUARIOS','PERFILES','REPRODUCCIONES','FACTURACIONES',
                     'PAGOS','FAVORITOS','CALIFICACIONES','REPORTES')
ORDER BY TABLE_NAME, TRIGGER_NAME`,
    endpoint: '/showcase/nt2/triggers',
  },
]

const NT3_SECTIONS: QuerySection[] = [
  {
    id: 'nt3-atomic',
    title: 'Transacción 1 — Atomicidad (Usuario + Perfil + Factura)',
    description:
      'Consulta de solo lectura que muestra usuario, perfil y facturas asociadas como ilustración del concepto de atomicidad.',
    sql: `SELECT
  U.ID_USUARIO, U.NOMBRE, U.EMAIL, U.ROL,
  P.ID_PERFIL, P.NOMBRE AS PERFIL,
  F.ID_FACTURACION, F.PERIODO_ANIO, F.PERIODO_MES, F.MONTO_FINAL, F.ESTADO_FACTURA
FROM USUARIOS U
LEFT JOIN PERFILES P ON P.ID_USUARIO = U.ID_USUARIO
LEFT JOIN FACTURACIONES F ON F.ID_USUARIO = U.ID_USUARIO
WHERE U.EMAIL LIKE '%seed@minflix.local'
  AND ROWNUM <= 10
ORDER BY U.ID_USUARIO, F.FECHA_CORTE DESC`,
    endpoint: '/showcase/nt3/atomic-demo',
  },
  {
    id: 'nt3-savepoint',
    title: 'Transacción 2 — SAVEPOINT (Facturación masiva)',
    description:
      'Muestra usuarios activos y el resumen de sus facturas como ilustración del uso de SAVEPOINT para manejo de errores parciales.',
    sql: `SELECT
  U.ID_USUARIO, U.NOMBRE, U.ESTADO_CUENTA,
  COUNT(F.ID_FACTURACION) AS TOTAL_FACTURAS,
  SUM(CASE WHEN F.ESTADO_FACTURA = 'PAGADA' THEN 1 ELSE 0 END) AS PAGADAS,
  SUM(CASE WHEN F.ESTADO_FACTURA = 'PENDIENTE' THEN 1 ELSE 0 END) AS PENDIENTES
FROM USUARIOS U
LEFT JOIN FACTURACIONES F ON F.ID_USUARIO = U.ID_USUARIO
WHERE U.ESTADO_CUENTA = 'ACTIVO'
  AND U.EMAIL LIKE '%seed@minflix.local'
GROUP BY U.ID_USUARIO, U.NOMBRE, U.ESTADO_CUENTA
ORDER BY U.ID_USUARIO`,
    endpoint: '/showcase/nt3/savepoint-demo',
  },
  {
    id: 'nt3-cascade',
    title: 'Transacción 3 — Eliminación en cascada',
    description:
      'Muestra todas las entidades relacionadas a un usuario (perfiles, reproducciones, favoritos) como ilustración del orden de eliminación en cascada.',
    sql: `SELECT 'USUARIO' AS ENTIDAD, U.ID_USUARIO AS ID, U.NOMBRE, U.EMAIL
FROM USUARIOS U WHERE U.EMAIL = 'usuario.seed@minflix.local'
UNION ALL
SELECT 'PERFIL', P.ID_PERFIL, P.NOMBRE, NULL
FROM PERFILES P
WHERE P.ID_USUARIO = (SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = 'usuario.seed@minflix.local')
UNION ALL
SELECT 'REPRODUCCION', R.ID_REPRODUCCION, C.TITULO, TO_CHAR(R.FECHA_INICIO, 'YYYY-MM-DD')
FROM REPRODUCCIONES R JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
WHERE R.ID_PERFIL IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = (SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = 'usuario.seed@minflix.local'))
UNION ALL
SELECT 'FAVORITO', F.ID_FAVORITO, C.TITULO, NULL
FROM FAVORITOS F JOIN CONTENIDOS C ON C.ID_CONTENIDO = F.ID_CONTENIDO
WHERE F.ID_PERFIL IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = (SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = 'usuario.seed@minflix.local'))
FETCH FIRST 20 ROWS ONLY`,
    endpoint: '/showcase/nt3/cascade-demo',
  },
  {
    id: 'nt3-concurrency',
    title: 'Escenario de Concurrencia — SELECT FOR UPDATE',
    description:
      'Bloqueo de fila durante cambio de plan. Sesión A adquiere FOR UPDATE; Sesión B espera hasta COMMIT o recibe ORA-00054/ORA-30006. No se ejecuta desde frontend por seguridad.',
    sql: `SELECT ID_USUARIO INTO v_id
FROM USUARIOS
WHERE EMAIL = 'usuario.seed@minflix.local'
FOR UPDATE WAIT 10;

-- Sesión B intenta:
SELECT ID_PLAN FROM USUARIOS
WHERE EMAIL = 'usuario.seed@minflix.local'
FOR UPDATE; -- espera o ORA-00054`,
    endpoint: null,
  },
  {
    id: 'nt3-locks',
    title: 'Bloqueos actuales en Oracle',
    description:
      'Muestra los bloqueos (locks) activos en Oracle como ilustración del mecanismo de concurrencia.',
    sql: `SELECT
  L.SESSION_ID, L.LOCK_TYPE, L.MODE_HELD, L.MODE_REQUESTED, L.LOCK_ID1, L.LOCK_ID2
FROM GV$LOCK L
JOIN GV$SESSION S ON S.SID = L.SESSION_ID
WHERE S.USERNAME IS NOT NULL AND L.TYPE != 'MR'
FETCH FIRST 20 ROWS ONLY`,
    endpoint: '/showcase/nt3/concurrency-locks',
  },
  {
    id: 'nt3-sessions',
    title: 'Sesiones activas en Oracle',
    description:
      'Muestra sesiones activas del servidor Oracle. Útil para ilustrar concurrencia y monitoreo.',
    sql: `SELECT SID, SERIAL#, USERNAME, STATUS, PROGRAM
FROM GV$SESSION
WHERE USERNAME IS NOT NULL AND STATUS = 'ACTIVE'
FETCH FIRST 20 ROWS ONLY`,
    endpoint: '/showcase/nt3/sessions',
  },
]

const NT4_SECTIONS: QuerySection[] = [
  {
    id: 'nt4-indexes',
    title: 'Índices académicos creados',
    description:
      'Lista los índices justificados con su tabla, columnas y tipo. Incluye los 4 índices nuevos del script 20_indices_nt4.sql.',
    sql: `SELECT IC.INDEX_NAME, IC.TABLE_NAME, IC.COLUMN_NAME,
       IC.COLUMN_POSITION, IC.DESCEND, I.INDEX_TYPE
FROM USER_IND_COLUMNS IC
JOIN USER_INDEXES I ON I.INDEX_NAME = IC.INDEX_NAME
WHERE IC.INDEX_NAME IN (
  'IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO',
  'IDX_CONTENIDOS_CATEGORIA_ANIO',
  'IDX_USUARIOS_CIUDAD_ESTADO',
  'IDX_CALIFICACIONES_CONTENIDO_FECHA'
)
ORDER BY IC.INDEX_NAME, IC.COLUMN_POSITION`,
    endpoint: '/showcase/nt4/indexes',
  },
  {
    id: 'nt4-explain',
    title: 'Referencia EXPLAIN PLAN',
    description:
      'Muestra la consulta de referencia usada para demostrar la mejora de rendimiento con el índice IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO. El plan real se ejecuta en SQL Developer con DBMS_XPLAN.',
    sql: `SELECT R.ID_REPRODUCCION, C.TITULO, R.FECHA_INICIO
FROM REPRODUCCIONES R
JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
WHERE R.ID_PERFIL = :perfil
ORDER BY R.FECHA_INICIO DESC
FETCH FIRST 50 ROWS ONLY`,
    endpoint: '/showcase/nt4/explain-plan-reference',
  },
]

const ALL_SECTIONS: Record<ActiveTab, QuerySection[]> = {
  nt1: NT1_SECTIONS,
  nt2: NT2_SECTIONS,
  nt3: NT3_SECTIONS,
  nt4: NT4_SECTIONS,
}

export function AcademicShowcasePage() {
  const navigate = useNavigate()
  const authSession = useMemo(() => getAuthSession(), [])
  const canAccess = authSession != null && hasAnalyticsRole(authSession.role)

  const [activeTab, setActiveTab] = useState<ActiveTab>('nt1')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Estado de ejecución por sección: { [sectionId]: { loading, data, queried } }
  const [results, setResults] = useState<
    Record<string, { loading: boolean; data: unknown; queried: boolean }>
  >({})

  // Estado de parámetros de entrada por sección: { [sectionId]: { [paramName]: value } }
  const [sectionParams, setSectionParams] = useState<
    Record<string, Record<string, string>>
  >(() => {
    const initial: Record<string, Record<string, string>> = {}
    Object.values(ALL_SECTIONS).forEach((sections) => {
      sections.forEach((s) => {
        if (s.paramFields) {
          initial[s.id] = {}
          s.paramFields.forEach((f) => {
            initial[s.id][f.name] = String(f.defaultValue)
          })
        }
      })
    })
    return initial
  })

  function handleSignOut() {
    setIsMobileMenuOpen(false)
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  const executeSection = useCallback(
    async (section: QuerySection) => {
      if (!section.endpoint) return

      setResults((prev) => ({
        ...prev,
        [section.id]: { loading: true, data: null, queried: true },
      }))

      try {
        const params: Record<string, string> = {}
        if (section.paramFields) {
          section.paramFields.forEach((f) => {
            params[f.name] = sectionParams[section.id]?.[f.name] ?? String(f.defaultValue)
          })
        }

        const response = await apiClient.get<unknown>(section.endpoint, { params })
        setResults((prev) => ({
          ...prev,
          [section.id]: { loading: false, data: response.data, queried: true },
        }))
      } catch {
        setResults((prev) => ({
          ...prev,
          [section.id]: { loading: false, data: null, queried: true },
        }))
        toast.error(`Error ejecutando: ${section.title}`)
      }
    },
    [sectionParams],
  )

  if (!authSession) {
    return <Navigate to="/login" replace />
  }

  const renderResult = (sectionId: string) => {
    const state = results[sectionId]
    if (!state || !state.queried) return null
    if (state.loading) {
      return (
        <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
          <h3>Ejecutando consulta...</h3>
          <p>Consultando Oracle.</p>
        </article>
      )
    }
    if (!state.data) {
      return (
        <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
          <h3>Sin resultados o error</h3>
          <p>La consulta no retornó datos.</p>
        </article>
      )
    }

    const rows = Array.isArray(state.data) ? state.data : [state.data]
    if (rows.length === 0) {
      return (
        <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
          <h3>Sin resultados</h3>
          <p>La consulta retornó 0 filas.</p>
        </article>
      )
    }

    const keys = Object.keys(rows[0] as Record<string, unknown>)

    return (
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: '#1a1a1a',
            borderRadius: '8px',
            overflow: 'hidden',
            fontSize: '0.85rem',
          }}
        >
          <thead>
            <tr style={{ background: '#2a2a2a' }}>
              {keys.map((k) => (
                <th
                  key={k}
                  style={{
                    padding: '0.6rem 0.8rem',
                    textAlign: 'left',
                    color: '#e5e5e5',
                    fontWeight: 600,
                    borderBottom: '1px solid #333',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const r = row as Record<string, unknown>
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                  {keys.map((k) => (
                    <td
                      key={k}
                      style={{
                        padding: '0.5rem 0.8rem',
                        color: '#ccc',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r[k] === null || r[k] === undefined
                        ? 'NULL'
                        : String(r[k])}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <main className="nf-shell nf-moderation-shell">
      <section className="nf-moderation-container">
        {/* Topbar */}
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
            aria-controls="showcase-menu"
          >
            <span className="nf-browse-menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>{isMobileMenuOpen ? 'Cerrar' : 'Menu'}</span>
          </button>

          <div
            id="showcase-menu"
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

        {!canAccess ? (
          <article className="nf-feature-card" style={{ marginTop: '1rem' }}>
            <h3>Acceso restringido</h3>
            <p>Esta seccion es exclusiva para usuarios con rol admin o analista.</p>
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
                <h1 className="nf-browse-section-title">Showcase Académico — NT1..NT4</h1>
              </header>

              <div className="nf-moderation-filters">
                <label htmlFor="showcase-tab-select" className="nf-rating-label">
                  Nucleo Tematico
                </label>
                <select
                  id="showcase-tab-select"
                  className="nf-input"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as ActiveTab)}
                >
                  <option value="nt1">NT1 — Consultas Avanzadas y Almacenamiento</option>
                  <option value="nt2">NT2 — Programacion PL/SQL</option>
                  <option value="nt3">NT3 — Transacciones y Concurrencia</option>
                  <option value="nt4">NT4 — Estrategias de Indexacion</option>
                </select>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
            >
              {ALL_SECTIONS[activeTab].map((section) => (
                <article
                  key={section.id}
                  className="nf-feature-card"
                  style={{ marginTop: '1rem' }}
                >
                  <header className="nf-catalog-row-header" style={{ marginBottom: '0.5rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>{section.title}</h3>
                  </header>
                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    {section.description}
                  </p>

                  <details style={{ marginBottom: '0.75rem' }}>
                    <summary
                      style={{
                        color: '#e50914',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      Ver SQL
                    </summary>
                    <pre
                      style={{
                        background: '#111',
                        color: '#0f0',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        overflowX: 'auto',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem',
                        border: '1px solid #333',
                      }}
                    >
                      {formatSQL(section.sql)}
                    </pre>
                  </details>

                  {section.paramFields && section.paramFields.length > 0 && (
                    <div
                      className="nf-moderation-filters"
                      style={{ gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}
                    >
                      {section.paramFields.map((field) => (
                        <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label className="nf-rating-label" style={{ fontSize: '0.75rem' }}>
                            {field.label}
                          </label>
                          <input
                            className="nf-input"
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={sectionParams[section.id]?.[field.name] ?? String(field.defaultValue)}
                            onChange={(e) =>
                              setSectionParams((prev) => ({
                                ...prev,
                                [section.id]: {
                                  ...(prev[section.id] ?? {}),
                                  [field.name]: e.target.value,
                                },
                              }))
                            }
                            style={{ minWidth: '6rem' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {section.endpoint ? (
                    <div className="nf-content-tile-actions">
                      <button
                        type="button"
                        className={buttonClassName('primary')}
                        onClick={() => void executeSection(section)}
                        disabled={results[section.id]?.loading}
                      >
                        {results[section.id]?.loading ? 'Ejecutando...' : 'Ejecutar consulta'}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: '#2a1a00',
                        border: '1px solid #664400',
                        borderRadius: '6px',
                        color: '#ffaa33',
                        fontSize: '0.85rem',
                      }}
                    >
                      Esta consulta es descriptiva y no se ejecuta desde el frontend por seguridad.
                    </div>
                  )}

                  {renderResult(section.id)}
                </article>
              ))}
            </motion.section>
          </>
        )}
      </section>
    </main>
  )
}
