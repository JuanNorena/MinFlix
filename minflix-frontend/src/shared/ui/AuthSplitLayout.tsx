/**
 * Layout reutilizable para vistas de autenticación con panel promocional.
 *
 * Divide la pantalla en dos paneles: uno promocional con animación de entrada
 * (chip, título y descripción) y otro con el formulario de autenticación.
 * Se usa en las páginas de login y registro.
 *
 * @see {@link LoginPage} para la página de inicio de sesión que usa este layout
 * @see {@link RegisterPage} para la página de registro que usa este layout
 */

/** Componente de animación de Framer Motion */
import { motion } from 'framer-motion'

/** Tipo de React para nodos hijos */
import type { ReactNode } from 'react'

/**
 * Props del layout de autenticación dividida.
 */
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
