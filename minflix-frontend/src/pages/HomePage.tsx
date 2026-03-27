import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { buttonClassName } from '../shared/ui/buttonStyles'

/**
 * Pantalla inicial del proyecto MinFlix.
 */
export function HomePage() {
  return (
    <main className="nf-shell">
      <section className="nf-hero-wrap">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="nf-chip"
        >
          MinFlix · Oracle + NestJS + React
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="nf-hero-title"
        >
          El backstage de streaming que conecta diseno, analitica y rendimiento.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="nf-hero-description"
        >
          Iniciamos con autenticacion real sobre Oracle. Esta primera fase implementa login y registro
          con experiencia visual de plataforma premium, preparados para evolucionar a catalogo y perfiles.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="nf-hero-actions"
        >
          <Link to="/login" className={buttonClassName('primary')}>
            Iniciar sesion
          </Link>
          <Link to="/planes" className={buttonClassName('ghost')}>
            Ver planes
          </Link>
          <Link to="/register" className={buttonClassName('ghost')}>
            Crear cuenta
          </Link>
          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noreferrer"
            className={buttonClassName('ghost')}
          >
            Ver Swagger
          </a>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="nf-feature-grid"
        >
          <article className="nf-feature-card">
            <h3>Autenticacion robusta</h3>
            <p>Passport local, JWT y hash bcrypt sobre Oracle Database.</p>
          </article>
          <article className="nf-feature-card">
            <h3>Escalamiento por fases</h3>
            <p>Base lista para catalogo, perfiles, reproduccion y analitica.</p>
          </article>
          <article className="nf-feature-card">
            <h3>Experiencia premium</h3>
            <p>UI consistente, responsive y optimizada para conversion en auth.</p>
          </article>
        </motion.section>
      </section>
    </main>
  )
}
