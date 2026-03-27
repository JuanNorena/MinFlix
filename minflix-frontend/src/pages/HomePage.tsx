import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * Pantalla inicial del proyecto MinFlix.
 */
export function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f9efe4,#f3f4f7_55%,#e6edf5)] px-6 py-16 text-slate-900">
      <section className="mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4 inline-flex rounded-full border border-slate-300 bg-white/70 px-4 py-1 text-sm font-medium tracking-wide"
        >
          MinFlix · Oracle + NestJS + React
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl"
        >
          Plataforma de streaming con arquitectura empresarial y base de datos Oracle.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-6 max-w-2xl text-lg text-slate-700"
        >
          Inicio de implementación habilitado. El backend usa Passport.js para autenticación y el frontend
          queda preparado para consumir la API con React Query y Axios.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link
            to="/login"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
          >
            Ir a Login
          </Link>
          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-400 px-5 py-3 transition hover:bg-white"
          >
            Ver Swagger
          </a>
        </motion.div>
      </section>
    </main>
  )
}
