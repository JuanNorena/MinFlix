export type ButtonVariant = 'primary' | 'ghost'

/**
 * Devuelve la clase visual estandar para botones y enlaces de accion.
 * @param variant - Variante visual requerida.
 * @returns Clase CSS reutilizable para acciones del UI.
 */
export function buttonClassName(variant: ButtonVariant): string {
  return variant === 'primary' ? 'nf-button-primary' : 'nf-button-ghost'
}
