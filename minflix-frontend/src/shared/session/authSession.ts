export interface AuthSession {
  userId: number
  email: string | null
  role: string
}

interface JwtPayload {
  sub?: number
  email?: string
  role?: string
}

const ACCESS_TOKEN_STORAGE_KEY = 'minflix_access_token'

/**
 * Recupera la sesion autenticada desde el JWT almacenado.
 * @returns Sesion de autenticacion o null cuando no es valida.
 */
export function getAuthSession(): AuthSession | null {
  const token = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)

  if (!token) {
    return null
  }

  const payload = decodeTokenPayload(token)
  if (!payload || typeof payload.sub !== 'number' || typeof payload.role !== 'string') {
    return null
  }

  return {
    userId: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : null,
    role: payload.role.toLowerCase(),
  }
}

/**
 * Verifica si una sesion tiene privilegios de moderacion.
 * @param session - Sesion autenticada.
 * @returns True para roles admin o soporte.
 */
export function hasModeratorRole(session: AuthSession | null): boolean {
  if (!session) {
    return false
  }

  return session.role === 'admin' || session.role === 'soporte'
}

function decodeTokenPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  try {
    const payloadJson = decodeBase64Url(parts[1])
    return JSON.parse(payloadJson) as JwtPayload
  } catch {
    return null
  }
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddingLength = (4 - (normalized.length % 4)) % 4
  const padded = normalized + '='.repeat(paddingLength)

  return window.atob(padded)
}
