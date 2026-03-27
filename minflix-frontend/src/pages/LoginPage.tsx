import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../shared/api/client'

const loginSchema = z.object({
  email: z.email('Ingrese un correo valido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

/**
 * Pantalla de inicio de sesion para autenticacion con Passport local.
 */
export function LoginPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin123*',
    },
  })

  /**
   * Envía credenciales al endpoint de login.
    * @param values - Datos del formulario de acceso.
   */
  const onSubmit = async (values: LoginForm) => {
    const response = await apiClient.post('/auth/login', values)
    // En la siguiente iteracion se movara a un store seguro con refresh token.
    window.localStorage.setItem('minflix_access_token', response.data.accessToken)
    window.alert('Sesion iniciada correctamente')
    navigate('/')
  }

  return (
    <main className="nf-shell">
      <section className="nf-auth-layout">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="nf-promo-panel"
        >
          <span className="nf-chip">Fase 1 · Autenticacion</span>
          <h1>Bienvenido de nuevo al panel de MinFlix.</h1>
          <p>
            Inicia sesion con Passport.js y JWT. Esta pantalla ya consume el backend conectado
            a Oracle para validar credenciales reales.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="nf-auth-card"
        >
          <h2>Iniciar sesion</h2>
          <p className="nf-subtitle">Acceso seguro con Passport local + JWT</p>

          <form className="nf-form" onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email">Correo</label>
            <input id="email" type="email" className="nf-input" {...register('email')} />
            {errors.email ? <p className="nf-error">{errors.email.message}</p> : null}

            <label htmlFor="password">Contrasena</label>
            <input id="password" type="password" className="nf-input" {...register('password')} />
            {errors.password ? <p className="nf-error">{errors.password.message}</p> : null}

            <button type="submit" disabled={isSubmitting} className="nf-button-primary">
              {isSubmitting ? 'Validando...' : 'Entrar'}
            </button>
          </form>

          <p className="nf-helper-row">
            Aun no tienes cuenta? <Link to="/register">Registrate</Link>
          </p>
        </motion.section>
      </section>
    </main>
  )
}
