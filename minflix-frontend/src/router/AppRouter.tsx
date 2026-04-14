import { Navigate, Route, Routes } from 'react-router-dom'
import { AnalyticsDashboardPage } from '../pages/AnalyticsDashboardPage'
import { BillingPage } from '../pages/BillingPage'
import { BrowsePage } from '../pages/BrowsePage'
import { ContentDetailPage } from '../pages/ContentDetailPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ProfileSelectorPage } from '../pages/ProfileSelectorPage'
import { ProfilesPage } from '../pages/ProfilesPage'
import { ReportsModerationPage } from '../pages/ReportsModerationPage'
import { RegisterPage } from '../pages/RegisterPage'
import { RequireAuth } from './RequireAuth'
import { RequireProfileSelection } from './RequireProfileSelection'
import { getActiveProfile } from '../shared/session/profileSession'

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

        <Route element={<RequireProfileSelection />}>
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/browse/content/:contentId" element={<ContentDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  )
}
