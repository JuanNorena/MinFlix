/**
 * Enrutador principal de la aplicación frontend de MinFlix.
 *
 * Define todas las rutas de la aplicación, incluyendo rutas públicas (home, login, registro)
 * y rutas protegidas que requieren autenticación (`RequireAuth`) y selección de perfil
 * (`RequireProfileSelection`). Calcula la ruta por defecto según el estado de sesión.
 *
 * @see {@link RequireAuth} para la guarda de autenticación
 * @see {@link RequireProfileSelection} para la guarda de selección de perfil
 * @see {@link getActiveProfile} para obtener el perfil activo de la sesión
 */

// --------------------------------------------------------------------------
// Importaciones de React Router y páginas
// --------------------------------------------------------------------------

/** Componentes de enrutamiento de React Router */
import { Navigate, Route, Routes } from 'react-router-dom'

/** Página de dashboard de analítica */
import { AnalyticsDashboardPage } from '../pages/AnalyticsDashboardPage'

/** Página de facturación y pagos */
import { BillingPage } from '../pages/BillingPage'

/** Página de exploración del catálogo */
import { BrowsePage } from '../pages/BrowsePage'

/** Página de detalle de contenido */
import { ContentDetailPage } from '../pages/ContentDetailPage'

/** Página de inicio (landing) */
import { HomePage } from '../pages/HomePage'

/** Página de inicio de sesión */
import { LoginPage } from '../pages/LoginPage'

/** Página de selección de perfil */
import { ProfileSelectorPage } from '../pages/ProfileSelectorPage'

/** Página de gestión de perfiles */
import { ProfilesPage } from '../pages/ProfilesPage'

/** Página de moderación de reportes */
import { ReportsModerationPage } from '../pages/ReportsModerationPage'

/** Página de showcase académico NT1..NT4 */
import { AcademicShowcasePage } from '../pages/AcademicShowcasePage'

/** Página de registro de cuenta */
import { RegisterPage } from '../pages/RegisterPage'

// --------------------------------------------------------------------------
// Importaciones de guardas y sesión
// --------------------------------------------------------------------------

/** Guarda que protege rutas privadas requiriendo autenticación */
import { RequireAuth } from './RequireAuth'

/** Guarda que protege rutas de reproducción requiriendo perfil activo */
import { RequireProfileSelection } from './RequireProfileSelection'

/** Helper para obtener el perfil activo de la sesión local */
import { getActiveProfile } from '../shared/session/profileSession'

/**
 * Resuelve la ruta por defecto según el estado de sesión del usuario.
 *
 * - Si no hay token de acceso, redirige al home (`/`).
 * - Si hay token pero no hay perfil activo, redirige a selección de perfil.
 * - Si hay token y perfil activo, redirige al explorador (`/browse`).
 *
 * @returns Ruta por defecto calculada dinámicamente.
 */
function resolveDefaultPath(): string {
  const accessToken = window.localStorage.getItem('minflix_access_token')

  if (!accessToken) {
    return '/'
  }

  return getActiveProfile() ? '/browse' : '/profiles/select'
}

/**
 * Enrutador principal de la aplicacion.
 */
export function AppRouter() {
  const defaultPath = resolveDefaultPath()

  return (
    <Routes>
      <Route
        path="/"
        element={
          defaultPath === '/' ? <HomePage /> : <Navigate to={defaultPath} replace />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/profiles/select" element={<ProfileSelectorPage />} />
        <Route path="/profiles/manage" element={<ProfilesPage />} />
        <Route path="/account/billing" element={<BillingPage />} />
        <Route path="/moderation/reports" element={<ReportsModerationPage />} />
        <Route path="/analytics/dashboard" element={<AnalyticsDashboardPage />} />
        <Route path="/academic-showcase" element={<AcademicShowcasePage />} />

        <Route element={<RequireProfileSelection />}>
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/browse/content/:contentId" element={<ContentDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  )
}
