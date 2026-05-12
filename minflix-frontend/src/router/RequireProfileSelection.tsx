/**
 * Guarda de selección de perfil para rutas de reproducción.
 *
 * Protege las rutas hijas exigiendo que el usuario haya seleccionado
 * un perfil activo. Si no hay perfil seleccionado, redirige a la
 * página de selección de perfiles.
 *
 * @see {@link AppRouter} para la configuración de rutas que requieren perfil
 * @see {@link getActiveProfile} para obtener el perfil activo de la sesión
 */

/** Componentes de navegación y enrutamiento de React Router */
import { Navigate, Outlet, useLocation } from 'react-router-dom'

/** Helper para obtener el perfil activo de la sesión local */
import { getActiveProfile } from '../shared/session/profileSession'

/**
 * Bloquea rutas de reproducción hasta que exista un perfil activo seleccionado.
 */
export function RequireProfileSelection() {
  const location = useLocation()
  const activeProfile = getActiveProfile()

  if (!activeProfile) {
    return <Navigate to="/profiles/select" replace state={{ from: location }} />
  }

  return <Outlet />
}
