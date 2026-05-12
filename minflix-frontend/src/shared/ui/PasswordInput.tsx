/**
 * Input de contraseña reutilizable con toggle para ver u ocultar texto.
 *
 * Renderiza un campo de contraseña con un botón de alternancia que muestra
 * u oculta el texto ingresado, usando iconos de Lucide React.
 *
 * @see {@link LoginPage} para el formulario de inicio de sesión
 * @see {@link RegisterPage} para el formulario de registro
 */

/** Hook de estado de React para controlar la visibilidad de la contraseña */
import { useState } from 'react'

/** Iconos de ojo abierto y cerrado de Lucide React */
import { Eye, EyeOff } from 'lucide-react'

/**
 * Props del componente de input de contraseña.
 */
interface PasswordInputProps {
  id: string
  value: string
  onChange: (nextValue: string) => void
  placeholder?: string
}

/**
 * Input de contrasena reutilizable con toggle para ver u ocultar texto usando iconos.
 */
export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="nf-password-wrap">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        className="nf-input nf-password-input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="nf-password-toggle"
        onClick={() => setShowPassword((current) => !current)}
        aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
        title={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
