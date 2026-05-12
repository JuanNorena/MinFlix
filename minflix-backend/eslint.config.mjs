/**
 * Configuración de ESLint para el backend de MinFlix.
 *
 * Aplica reglas recomendadas de TypeScript, Prettier y validación de sintaxis
 * TSDoc (`tsdoc/syntax`) para mantener la calidad del código y la documentación
 * inline del proyecto. Configura el entorno Node.js y Jest para las pruebas.
 *
 * @see {@link https://typescript-eslint.io/} para la configuración de TypeScript
 * @see {@link https://eslint-plugin-tsdoc.org/} para la validación de TSDoc
 */

// @ts-check

/** Configuraciones recomendadas de ESLint Core */
import eslint from '@eslint/js';

/** Configuración recomendada de Prettier para ESLint */
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** Plugin de validación de sintaxis TSDoc */
import tsdoc from 'eslint-plugin-tsdoc';

/** Variables globales del entorno Node.js y Jest */
import globals from 'globals';

/** Configuración de TypeScript para ESLint */
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      'tsdoc/syntax': 'error',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
    plugins: {
      tsdoc,
    },
  },
);
