import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiClient } from '../shared/api/client'
import { profileInitials, resolveAvatarUrl } from '../shared/helpers/avatarUrl'
import {
  clearActiveProfile,
  saveActiveProfile,
} from '../shared/session/profileSession'
import { buttonClassName } from '../shared/ui/buttonStyles'

interface AccountProfile {
  id: number
  nombre: string
  avatar: string | null
  tipoPerfil: string
}

/**
 * Vista de seleccion de perfil posterior al login, inspirada en el flujo de Netflix.
 */
export function ProfileSelectorPage() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<AccountProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void fetchProfiles()
  }, [])

  /**
   * Carga perfiles de la cuenta autenticada.
   */
  async function fetchProfiles() {
    try {
      setIsLoading(true)
      const response = await apiClient.get<AccountProfile[]>('/auth/profiles')
      setProfiles(response.data)
    } catch {
      toast.error('No se pudieron cargar los perfiles de tu cuenta.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Marca un perfil como activo y redirige a la vista interna.
   * @param profile - Perfil elegido en pantalla.
   */
  function handleSelectProfile(profile: AccountProfile) {
    saveActiveProfile({
      id: profile.id,
      nombre: profile.nombre,
      tipoPerfil: profile.tipoPerfil,
      avatar: profile.avatar,
    })

    navigate('/browse', { replace: true })
  }

  /**
   * Cierra sesion del usuario autenticado.
   */
  function handleSignOut() {
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  return (
    <main className="nf-profile-selector-shell">
      <section className="nf-profile-selector-wrap">
        <motion.h1
          className="nf-profile-selector-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          Quien esta viendo ahora?
        </motion.h1>

        {isLoading ? (
          <p className="nf-profile-selector-loading">Cargando perfiles...</p>
        ) : profiles.length === 0 ? (
          <section className="nf-profile-empty-state">
            <h2>No hay perfiles disponibles</h2>
            <p>Crea tu primer perfil para continuar con la experiencia.</p>
            <Link to="/profiles/manage" className={buttonClassName('primary')}>
              Crear perfil
            </Link>
          </section>
        ) : (
          <motion.div
            className="nf-profile-selector-grid"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.4 }}
          >
            {profiles.map((profile) => {
              const avatarUrl = resolveAvatarUrl(profile.avatar)

              return (
                <button
                  key={profile.id}
                  type="button"
                  className="nf-profile-tile"
                  onClick={() => handleSelectProfile(profile)}
                >
                  <span className="nf-profile-avatar-frame">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`Avatar de ${profile.nombre}`}
                        className="nf-profile-avatar-image"
                        loading="lazy"
                      />
                    ) : (
                      <span className="nf-profile-avatar-fallback">
                        {profileInitials(profile.nombre)}
                      </span>
                    )}
                  </span>
                  <span className="nf-profile-name">{profile.nombre}</span>
                </button>
              )
            })}
          </motion.div>
        )}

        <motion.div
          className="nf-profile-selector-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
        >
          <Link to="/profiles/manage" className="nf-profile-manage-button">
            Administrar perfiles
          </Link>
          <button
            type="button"
            className={buttonClassName('ghost')}
            onClick={handleSignOut}
          >
            Cerrar sesion
          </button>
        </motion.div>
      </section>
    </main>
  )
}
