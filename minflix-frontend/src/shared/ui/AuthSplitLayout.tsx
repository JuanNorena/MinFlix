import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AuthSplitLayoutProps {
  chip: string
  title: string
  description: string
  children: ReactNode
}

/**
 * Layout reutilizable para vistas de autenticacion con panel promocional.
 */
export function AuthSplitLayout({
  chip,
  title,
  description,
  children,
}: AuthSplitLayoutProps) {
  return (
    <main className="nf-shell">
      <section className="nf-auth-layout">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="nf-promo-panel"
        >
          <span className="nf-chip">{chip}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="nf-auth-card"
        >
          {children}
        </motion.section>
      </section>
    </main>
  )
}
