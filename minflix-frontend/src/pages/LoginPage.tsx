/**
 * Página de inicio de sesión de MinFlix.
 *
 * Formulario de autenticación con email y contraseña que consume el endpoint
 * `POST /auth/login` del backend. Al iniciar sesión exitosamente, guarda el
 * token JWT en `localStorage` y redirige al selector de perfiles.
 *
 * @see {@link AuthService} para la lógica de autenticación del backend
 * @see {@link AuthController} para el endpoint de login
 * @see {@link AuthSplitLayout} para el layout visual dividido
 */

// --------------------------------------------------------------------------
// Importaciones de React y librerías de formularios
// --------------------------------------------------------------------------

/** Hooks y componentes de React Hook Form para gestión de formularios */
import { Controller, useForm } from 'react-hook-form'

/** Librería de validación de esquemas */
import { z } from 'zod'

/** Resolver de Zod para React Hook Form */
import { zodResolver } from '@hookform/resolvers/zod'

/** Componentes de navegación y enrutamiento de React Router */
import { Link, useNavigate } from 'react-router-dom'

/** Notificaciones toast para retroalimentación al usuario */
import { toast } from 'react-hot-toast'

// --------------------------------------------------------------------------
// Importaciones de utilidades compartidas
// --------------------------------------------------------------------------

/** Cliente HTTP para consumir la API del backend */
import { apiClient } from '../shared/api/client'

/** Textos de ayuda para los campos del formulario */
import { authFieldHelp } from '../shared/helpers/authFieldHelp'

/** Helper para limpiar el perfil activo al iniciar sesión */
import { clearActiveProfile } from '../shared/session/profileSession'

/** Layout dividido para vistas de autenticación */
import { AuthSplitLayout } from '../shared/ui/AuthSplitLayout'

/** Helper para obtener clases CSS de botones */
import { buttonClassName } from '../shared/ui/buttonStyles'

/** Componente de input de contraseña con toggle de visibilidad */
import { PasswordInput } from '../shared/ui/PasswordInput'

/**
 * Esquema de validación Zod para el formulario de inicio de sesión.
 */
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
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  /**
   * Envia credenciales al endpoint de login.
   * @param values - Datos del formulario de acceso.
   */
  const onSubmit = async (values: LoginForm) => {
    try {
      const response = await apiClient.post('/auth/login', values)
      // En la siguiente iteracion se movara a un store seguro con refresh token.
      window.localStorage.setItem('minflix_access_token', response.data.accessToken)
      clearActiveProfile()
      toast.success('Sesion iniciada correctamente')
      navigate('/profiles/select', { replace: true })
    } catch {
      toast.error('No pudimos iniciar sesion. Revisa tu correo y contrasena.')
    }
  }

  return (
    <AuthSplitLayout
      chip="Bienvenido a casa"
      title="Todo lo que te gusta, en un solo lugar."
      description="Inicia sesion y sigue disfrutando tus series, peliculas y documentales favoritos."
    >
      <h2>Iniciar sesion</h2>
      <p className="nf-subtitle">Tu cuenta te esta esperando</p>

      <form className="nf-form" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">Correo</label>
        <input id="email" type="email" className="nf-input" {...register('email')} />
        <p className="nf-helper-field">{authFieldHelp.loginEmail}</p>
        {errors.email ? <p className="nf-error">{errors.email.message}</p> : null}

        <label htmlFor="password">Contrasena</label>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordInput
              id="password"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
        <p className="nf-helper-field">{authFieldHelp.loginPassword}</p>
        {errors.password ? <p className="nf-error">{errors.password.message}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClassName('primary')}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="nf-helper-row">
        Aun no tienes cuenta? <Link to="/register">Registrate</Link>
      </p>
    </AuthSplitLayout>
  )
}
