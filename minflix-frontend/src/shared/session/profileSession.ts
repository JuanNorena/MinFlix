export interface ActiveProfileSession {
  id: number
  nombre: string
  avatar: string | null
  tipoPerfil: string
}

const ACTIVE_PROFILE_STORAGE_KEY = 'minflix_active_profile'

/**
 * Guarda el perfil seleccionado para mantener contexto de reproduccion.
 * @param profile - Perfil activo elegido por el usuario.
 */
export function saveActiveProfile(profile: ActiveProfileSession): void {
  window.localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

/**
 * Recupera el perfil activo almacenado en la sesion del navegador.
 * @returns Perfil activo o null si no existe o es invalido.
 */
export function getActiveProfile(): ActiveProfileSession | null {
  const rawProfile = window.localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY)
  if (!rawProfile) {
    return null
  }

  try {
    const parsed = JSON.parse(rawProfile) as Partial<ActiveProfileSession>

    if (
      typeof parsed.id === 'number'
      && typeof parsed.nombre === 'string'
      && typeof parsed.tipoPerfil === 'string'
    ) {
      return {
        id: parsed.id,
        nombre: parsed.nombre,
        tipoPerfil: parsed.tipoPerfil,
        avatar: typeof parsed.avatar === 'string' ? parsed.avatar : null,
      }
    }

    window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY)
    return null
  } catch {
    window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY)
    return null
  }
}

/**
 * Limpia el perfil activo cuando el usuario cambia de cuenta o cierra sesion.
 */
export function clearActiveProfile(): void {
  window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY)
}
