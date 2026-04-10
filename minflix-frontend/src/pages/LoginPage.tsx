import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { apiClient } from '../shared/api/client'
import { authFieldHelp } from '../shared/helpers/authFieldHelp'
import { clearActiveProfile } from '../shared/session/profileSession'
import { AuthSplitLayout } from '../shared/ui/AuthSplitLayout'
import { buttonClassName } from '../shared/ui/buttonStyles'
import { PasswordInput } from '../shared/ui/PasswordInput'

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
