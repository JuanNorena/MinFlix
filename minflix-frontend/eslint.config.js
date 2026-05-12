/**
 * Configuración de ESLint para el frontend de MinFlix.
 *
 * Aplica reglas recomendadas de JavaScript, TypeScript, React Hooks y React Refresh,
 * además de la validación de sintaxis TSDoc (`tsdoc/syntax`) para mantener la calidad
 * de la documentación inline del proyecto.
 *
 * @see {@link https://typescript-eslint.io/} para la configuración de TypeScript
 * @see {@link https://eslint-plugin-tsdoc.org/} para la validación de TSDoc
 */

/** Configuraciones recomendadas de ESLint Core */
import js from '@eslint/js'

/** Variables globales del entorno del navegador */
import globals from 'globals'

/** Plugin de reglas para React Hooks */
import reactHooks from 'eslint-plugin-react-hooks'

/** Plugin de reglas para React Fast Refresh */
import reactRefresh from 'eslint-plugin-react-refresh'

/** Plugin de validación de sintaxis TSDoc */
import tsdoc from 'eslint-plugin-tsdoc'

/** Configuración de TypeScript para ESLint */
import tseslint from 'typescript-eslint'

/** Helpers para definir configuración e ignorar rutas */
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      tsdoc,
    },
    rules: {
      'tsdoc/syntax': 'error',
    },
  },
])
