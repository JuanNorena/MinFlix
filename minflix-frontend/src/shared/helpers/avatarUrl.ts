const defaultApiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
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
