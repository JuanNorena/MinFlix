import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { plansCatalog, profileHelperNotes } from '../shared/helpers/plansCatalog'
import { buttonClassName } from '../shared/ui/buttonStyles'

/**
 * Vista de planes y beneficios para guiar la seleccion durante el registro.
 */
export function PlansPage() {
  return (
    <main className="nf-shell">
      <section className="nf-hero-wrap">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="nf-chip"
        >
          Planes · Beneficios · Ayuda
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="nf-hero-title"
        >
          Elige un plan claro para cada tipo de hogar.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45 }}
          className="nf-hero-description"
        >
          Esta vista explica precios, limites y beneficios para apoyar el registro sin ambiguedad.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.45 }}
          className="nf-plans-grid"
        >
          {plansCatalog.map((plan) => (
            <article className="nf-plan-card" key={plan.code}>
              <h3>{plan.title}</h3>
              <p className="nf-plan-price">{plan.monthlyPrice} / mes</p>
              <p className="nf-plan-meta">{plan.profileLimit}</p>
              <p className="nf-plan-meta">Calidad: {plan.quality}</p>
              <p className="nf-plan-meta">Dispositivos: {plan.simultaneousDevices}</p>
              <ul>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45 }}
          className="nf-helper-panel"
        >
          <h2>Aclaracion importante: Perfil inicial</h2>
          <ul>
            {profileHelperNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="nf-hero-actions"
        >
          <Link to="/register" className={buttonClassName('primary')}>
            Continuar al registro
          </Link>
          <Link to="/" className={buttonClassName('ghost')}>
            Volver al inicio
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
