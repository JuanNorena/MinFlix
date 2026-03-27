import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { buttonClassName } from '../shared/ui/buttonStyles'
import { plansCatalog } from '../shared/helpers/plansCatalog'

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
          Películas, series ilimitadas y mucho más
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="nf-hero-description"
        >
          Disfruta donde quieras. Cancela cuando quieras. Iniciamos con autenticación sobre Oracle Database.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="nf-hero-actions"
          style={{ marginTop: '2rem' }}
        >
          <Link to="/login" className={buttonClassName('primary')}>
            Iniciar sesión
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

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          style={{ marginTop: '4rem' }}
        >
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Planes disponibles</h2>
          <div className="nf-plans-grid">
            {plansCatalog.map((plan) => (
              <article key={plan.code} className="nf-plan-card">
                <h3>{plan.title}</h3>
                <p className="nf-plan-price">{plan.monthlyPrice} / mes</p>
                <p className="nf-plan-meta">{plan.profileLimit}</p>
                <p className="nf-plan-meta">Calidad: {plan.quality}</p>
                <p className="nf-plan-meta">Dispositivos: {plan.simultaneousDevices}</p>
                <ul>
                  {plan.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}
