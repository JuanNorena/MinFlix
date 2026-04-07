import { Navigate, Outlet, useLocation } from 'react-router-dom'

/**
 * Protege rutas privadas exigiendo token JWT en almacenamiento local.
 */
export function RequireAuth() {
  const location = useLocation()
  const accessToken = window.localStorage.getItem('minflix_access_token')

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
