/**
 * Helpers para la resolución de URLs de avatares y generación de iniciales.
 *
 * Construye URLs absolutas para avatares de perfil a partir de rutas relativas
 * y genera iniciales visuales como fallback cuando no hay imagen disponible.
 *
 * @see {@link resolveAvatarUrl} para construir la URL completa de un avatar
 * @see {@link profileInitials} para generar las iniciales de un perfil
 */

/** URL base de la API usada para derivar el origen del backend */
const defaultApiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

/** Origen del backend (dominio + puerto) sin el path de la API */
const backendOrigin = defaultApiBaseUrl.replace(/\/api\/v1\/?$/, '')

/**
 * Resuelve la URL final del avatar, soportando rutas relativas y absolutas.
 * @param avatar - URL o path del avatar almacenado en base de datos.
 * @returns URL utilizable para etiquetas <img> o null si no existe avatar.
 */
export function resolveAvatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar) {
    return null
  }

  if (/^https?:\/\//i.test(avatar)) {
    return avatar
  }

  if (avatar.startsWith('/')) {
    return `${backendOrigin}${avatar}`
  }

  return `${backendOrigin}/${avatar}`
}

/**
 * Genera iniciales para fallback visual cuando no hay imagen cargada.
 * @param profileName - Nombre del perfil.
 * @returns Texto breve de 1-2 caracteres.
 */
export function profileInitials(profileName: string): string {
  const initials = profileName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return initials || 'MF'
}
