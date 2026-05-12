/**
 * Página de registro de cuenta de MinFlix.
 *
 * Formulario de registro completo que recopila los datos personales del usuario,
 * el plan de suscripción y el perfil inicial. Valida los campos con Zod y
 * consume el endpoint `POST /auth/register` del backend.
 *
 * @see {@link AuthService} para la lógica de registro del backend
 * @see {@link AuthController} para el endpoint de registro
 * @see {@link AuthSplitLayout} para el layout visual dividido
 */

// --------------------------------------------------------------------------
// Importaciones de React y librerías de formularios
// --------------------------------------------------------------------------

/** Resolver de Zod para React Hook Form */
import { zodResolver } from '@hookform/resolvers/zod'

/** Hooks y componentes de React Hook Form para gestión de formularios */
import { Controller, useForm } from 'react-hook-form'

/** Componentes de navegación y enrutamiento de React Router */
import { Link, useNavigate } from 'react-router-dom'

/** Notificaciones toast para retroalimentación al usuario */
import { toast } from 'react-hot-toast'

/** Librería de validación de esquemas */
import { z } from 'zod'

// --------------------------------------------------------------------------
// Importaciones de utilidades compartidas
// --------------------------------------------------------------------------

/** Cliente HTTP para consumir la API del backend */
import { apiClient } from '../shared/api/client'

/** Textos de ayuda para los campos del formulario */
import { authFieldHelp } from '../shared/helpers/authFieldHelp'

/** Helper para limpiar el perfil activo al registrarse */
import { clearActiveProfile } from '../shared/session/profileSession'

/** Layout dividido para vistas de autenticación */
import { AuthSplitLayout } from '../shared/ui/AuthSplitLayout'

/** Helper para obtener clases CSS de botones */
import { buttonClassName } from '../shared/ui/buttonStyles'

/** Componente de input de contraseña con toggle de visibilidad */
import { PasswordInput } from '../shared/ui/PasswordInput'

/**
 * Esquema de validación Zod para el formulario de registro de cuenta.
 */
const registerSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.email('Ingrese un correo valido'),
  telefono: z
    .string()
    .regex(/^[0-9]{7,15}$/, 'El telefono debe tener entre 7 y 15 digitos'),
  fechaNacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha valida'),
  ciudadResidencia: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
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
      telefono: '',
      fechaNacimiento: '',
      ciudadResidencia: '',
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

        <label htmlFor="telefono">Telefono</label>
        <input id="telefono" type="tel" className="nf-input" {...register('telefono')} />
        <p className="nf-helper-field">{authFieldHelp.registerPhone}</p>
        {errors.telefono ? <p className="nf-error">{errors.telefono.message}</p> : null}

        <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
        <input
          id="fechaNacimiento"
          type="date"
          className="nf-input"
          {...register('fechaNacimiento')}
        />
        <p className="nf-helper-field">{authFieldHelp.registerBirthDate}</p>
        {errors.fechaNacimiento ? (
          <p className="nf-error">{errors.fechaNacimiento.message}</p>
        ) : null}

        <label htmlFor="ciudadResidencia">Ciudad de residencia</label>
        <input
          id="ciudadResidencia"
          type="text"
          className="nf-input"
          {...register('ciudadResidencia')}
        />
        <p className="nf-helper-field">{authFieldHelp.registerCity}</p>
        {errors.ciudadResidencia ? (
          <p className="nf-error">{errors.ciudadResidencia.message}</p>
        ) : null}

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
