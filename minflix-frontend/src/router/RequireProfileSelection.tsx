import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getActiveProfile } from '../shared/session/profileSession'

/**
 * Bloquea rutas de reproduccion hasta que exista un perfil activo seleccionado.
 */
export function RequireProfileSelection() {
  const location = useLocation()
  const activeProfile = getActiveProfile()

  if (!activeProfile) {
    return <Navigate to="/profiles/select" replace state={{ from: location }} />
  }

  return <Outlet />
}
