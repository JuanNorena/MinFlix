/**
 * Utilidades de estilos de botones reutilizables en el frontend.
 *
 * Define el tipo de variante de botón y una función helper que retorna
 * la clase CSS correspondiente para los botones primarios y fantasmas
 * usados en toda la interfaz de MinFlix.
 *
 * @see {@link buttonClassName} para obtener la clase CSS de un botón
 */

/** Variantes visuales disponibles para botones de acción */
export type ButtonVariant = 'primary' | 'ghost'

/**
 * Devuelve la clase visual estándar para botones y enlaces de acción.
 *
 * @param variant - Variante visual requerida (`primary` o `ghost`).
 * @returns Clase CSS reutilizable para acciones del UI.
 */
export function buttonClassName(variant: ButtonVariant): string {
  return variant === 'primary' ? 'nf-button-primary' : 'nf-button-ghost'
}
