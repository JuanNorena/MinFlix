/**
 * Guarda de autenticación para rutas privadas del frontend.
 *
 * Protege las rutas hijas exigiendo que exista un token JWT válido
 * en el almacenamiento local (`minflix_access_token`). Si no hay token,
 * redirige al usuario a la página de inicio de sesión.
 *
 * @see {@link AppRouter} para la configuración de rutas protegidas
 */

/** Componentes de navegación y enrutamiento de React Router */
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
