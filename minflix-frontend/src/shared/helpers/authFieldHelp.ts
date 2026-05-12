/**
 * Textos de ayuda reutilizables para los campos de los formularios de autenticación.
 *
 * Proporciona descripciones explicativas para cada campo del flujo de login y registro,
 * mejorando la experiencia de usuario al completar los formularios.
 *
 * @see {@link LoginPage} para el formulario de inicio de sesión
 * @see {@link RegisterPage} para el formulario de registro de cuenta
 */
export const authFieldHelp = {
  loginEmail: 'Ingresa el correo con el que te registraste en MinFlix.',
  loginPassword: 'Tu contrasena mantiene tu cuenta y tus perfiles protegidos.',
  registerPlan:
    'Tu plan define cuantas personas pueden ver al mismo tiempo y la calidad de video.',
  registerInitialProfile:
    'Este sera el primer perfil de tu cuenta para guardar recomendaciones e historial.',
  registerPassword:
    'Recomendado: minimo 8 caracteres con letras, numeros y simbolos.',
  registerPhone:
    'Usa un numero de contacto valido para soporte y recuperacion de cuenta.',
  registerBirthDate:
    'Esta fecha se utiliza para validaciones de edad y segmentacion responsable.',
  registerCity:
    'Tu ciudad ayuda a consolidar reportes de consumo e ingresos por territorio.',
} as const
