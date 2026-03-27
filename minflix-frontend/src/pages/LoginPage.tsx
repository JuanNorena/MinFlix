import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@minflix.com',
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
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16">
      <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-slate-600">Autenticacion con Passport.js (local + JWT)</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('email')}
            />
            {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register('password')}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
