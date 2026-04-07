import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { plansCatalog } from '../shared/helpers/plansCatalog'
import { profileInitials, resolveAvatarUrl } from '../shared/helpers/avatarUrl'
import {
  clearActiveProfile,
  getActiveProfile,
} from '../shared/session/profileSession'
import { buttonClassName } from '../shared/ui/buttonStyles'

/**
 * Vista interna posterior a la seleccion de perfil.
 */
export function BrowsePage() {
  const navigate = useNavigate()
  const activeProfile = getActiveProfile()

  const avatarUrl = useMemo(
    () => resolveAvatarUrl(activeProfile?.avatar ?? null),
    [activeProfile],
  )

  if (!activeProfile) {
    return <Navigate to="/profiles/select" replace />
  }

  /**
   * Cierra sesion y limpia contexto de perfil activo.
   */
  function handleSignOut() {
    window.localStorage.removeItem('minflix_access_token')
    clearActiveProfile()
    navigate('/login', { replace: true })
  }

  return (
    <main className="nf-shell">
      <section className="nf-hero-wrap">
        <motion.p
          className="nf-chip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          Perfil activo
        </motion.p>

        <motion.div
          className="nf-browse-header"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4 }}
        >
          <span className="nf-browse-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`Avatar de ${activeProfile.nombre}`}
                className="nf-browse-avatar-image"
              />
            ) : (
              <span>{profileInitials(activeProfile.nombre)}</span>
            )}
          </span>

          <div>
            <h1 className="nf-hero-title" style={{ maxWidth: 'none' }}>
              Hola, {activeProfile.nombre}
            </h1>
            <p className="nf-hero-description">
              Ya ingresaste con tu perfil. Desde aqui continua con catalogo y
              reproduccion sin volver a la landing publica.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="nf-hero-actions"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
        >
          <Link to="/profiles/select" className={buttonClassName('ghost')}>
            Cambiar perfil
          </Link>
          <Link to="/profiles/manage" className={buttonClassName('ghost')}>
            Administrar perfiles
          </Link>
          <button
            type="button"
            className={buttonClassName('primary')}
            onClick={handleSignOut}
          >
            Cerrar sesion
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
          style={{ marginTop: '2.4rem' }}
        >
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
            Planes disponibles
          </h2>
          <div className="nf-plans-grid">
            {plansCatalog.map((plan) => (
              <article key={plan.code} className="nf-plan-card">
                <h3>{plan.title}</h3>
                <p className="nf-plan-price">{plan.monthlyPrice} / mes</p>
                <p className="nf-plan-meta">{plan.profileLimit}</p>
                <p className="nf-plan-meta">Calidad: {plan.quality}</p>
                <p className="nf-plan-meta">
                  Dispositivos: {plan.simultaneousDevices}
                </p>
              </article>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}
