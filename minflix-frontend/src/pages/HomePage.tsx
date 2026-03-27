import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * Pantalla inicial del proyecto MinFlix.
 */
export function HomePage() {
  return (
    <main className="nf-shell">
      <section className="mx-auto max-w-6xl px-6 py-16">
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
          className="max-w-4xl text-4xl leading-tight md:text-6xl"
        >
          El backstage de streaming que conecta diseno, analitica y rendimiento.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-6 max-w-3xl text-lg text-white/75"
        >
          Iniciamos con autenticacion real sobre Oracle. Esta primera fase implementa login y registro
          con experiencia visual de plataforma premium, preparados para evolucionar a catalogo y perfiles.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link to="/login" className="nf-button-primary">
            Iniciar sesion
          </Link>
          <Link to="/register" className="nf-button-ghost">
            Crear cuenta
          </Link>
          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="nf-button-ghost"
          >
            Ver Swagger
          </a>
        </motion.div>
      </section>
    </main>
  )
}
