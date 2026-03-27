import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { apiClient } from '../shared/api/client'

const registerSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.email('Ingrese un correo valido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  planNombre: z.enum(['BASICO', 'ESTANDAR', 'PREMIUM']),
  nombrePerfilInicial: z.string().min(2, 'El perfil inicial debe tener al menos 2 caracteres'),
})

type RegisterForm = z.infer<typeof registerSchema>

/**
 * Vista de registro de cuenta con estilo visual principal de MinFlix.
 */
export function RegisterPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      planNombre: 'BASICO',
      nombrePerfilInicial: '',
    },
  })

  /**
   * Registra usuario en backend y almacena el token devuelto.
   * @param values - Datos del formulario de registro.
   */
  const onSubmit = async (values: RegisterForm) => {
    const response = await apiClient.post('/auth/register', values)
    window.localStorage.setItem('minflix_access_token', response.data.accessToken)
    window.alert('Cuenta creada correctamente')
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
          <span className="nf-chip">Cuenta principal</span>
          <h1>Crea tu cuenta y arranca tu catalogo personalizado.</h1>
          <p>
            Registro de usuario principal con plan inicial y primer perfil de reproduccion,
            conectado directamente a Oracle.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="nf-auth-card"
        >
          <h2>Registro</h2>
          <p className="nf-subtitle">Configura tu cuenta de acceso MinFlix</p>

          <form className="nf-form" onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="nombre">Nombre completo</label>
            <input id="nombre" type="text" className="nf-input" {...register('nombre')} />
            {errors.nombre ? <p className="nf-error">{errors.nombre.message}</p> : null}

            <label htmlFor="email">Correo</label>
            <input id="email" type="email" className="nf-input" {...register('email')} />
            {errors.email ? <p className="nf-error">{errors.email.message}</p> : null}

            <label htmlFor="password">Contrasena</label>
            <input id="password" type="password" className="nf-input" {...register('password')} />
            {errors.password ? <p className="nf-error">{errors.password.message}</p> : null}

            <label htmlFor="planNombre">Plan inicial</label>
            <select id="planNombre" className="nf-input" {...register('planNombre')}>
              <option value="BASICO">Basico</option>
              <option value="ESTANDAR">Estandar</option>
              <option value="PREMIUM">Premium</option>
            </select>
            {errors.planNombre ? <p className="nf-error">{errors.planNombre.message}</p> : null}

            <label htmlFor="nombrePerfilInicial">Perfil inicial</label>
            <input
              id="nombrePerfilInicial"
              type="text"
              className="nf-input"
              {...register('nombrePerfilInicial')}
            />
            {errors.nombrePerfilInicial ? (
              <p className="nf-error">{errors.nombrePerfilInicial.message}</p>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="nf-button-primary">
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="nf-helper-row">
            Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
          </p>
        </motion.section>
      </section>
    </main>
  )
}
