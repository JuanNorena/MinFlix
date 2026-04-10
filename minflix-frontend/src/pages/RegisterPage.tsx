import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { apiClient } from '../shared/api/client'
import { authFieldHelp } from '../shared/helpers/authFieldHelp'
import { clearActiveProfile } from '../shared/session/profileSession'
import { AuthSplitLayout } from '../shared/ui/AuthSplitLayout'
import { buttonClassName } from '../shared/ui/buttonStyles'
import { PasswordInput } from '../shared/ui/PasswordInput'

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
    control,
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
    try {
      const response = await apiClient.post('/auth/register', values)
      window.localStorage.setItem('minflix_access_token', response.data.accessToken)
      clearActiveProfile()
      toast.success('Cuenta creada correctamente')
      navigate('/profiles/select', { replace: true })
    } catch {
      toast.error('No pudimos crear tu cuenta. Intenta de nuevo en unos momentos.')
    }
  }

  return (
    <AuthSplitLayout
      chip="Empieza hoy"
      title="Crea tu cuenta y empieza a disfrutar ahora."
      description="Elige tu plan, crea tu perfil y descubre contenido hecho para ti."
    >
      <h2>Registro</h2>
      <p className="nf-subtitle">Toma menos de un minuto</p>

      <form className="nf-form" onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="nombre">Nombre completo</label>
        <input id="nombre" type="text" className="nf-input" {...register('nombre')} />
        {errors.nombre ? <p className="nf-error">{errors.nombre.message}</p> : null}

        <label htmlFor="email">Correo</label>
        <input id="email" type="email" className="nf-input" {...register('email')} />
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
        <p className="nf-helper-field">{authFieldHelp.registerPassword}</p>
        {errors.password ? <p className="nf-error">{errors.password.message}</p> : null}

        <label htmlFor="planNombre">Plan inicial</label>
        <select id="planNombre" className="nf-input" {...register('planNombre')}>
          <option value="BASICO">Basico</option>
          <option value="ESTANDAR">Estandar</option>
          <option value="PREMIUM">Premium</option>
        </select>
        <p className="nf-helper-field">{authFieldHelp.registerPlan}</p>
        {errors.planNombre ? <p className="nf-error">{errors.planNombre.message}</p> : null}

        <label htmlFor="nombrePerfilInicial">Perfil inicial</label>
        <input
          id="nombrePerfilInicial"
          type="text"
          className="nf-input"
          {...register('nombrePerfilInicial')}
        />
        <p className="nf-helper-field">{authFieldHelp.registerInitialProfile}</p>
        {errors.nombrePerfilInicial ? (
          <p className="nf-error">{errors.nombrePerfilInicial.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonClassName('primary')}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="nf-helper-row">
        Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
      </p>
    </AuthSplitLayout>
  )
}
