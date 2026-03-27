# Guia de Diseno UI - Fase 1 (Auth)

## Objetivo visual
Construir una experiencia de autenticacion estilo plataforma de streaming premium: alto contraste, jerarquia tipografica fuerte y enfoque en conversion (login/registro).

## Paleta base
- Rojo principal: #e50914
- Rojo secundario: #f84b54
- Dorado acento: #ffc857
- Fondo profundo 1: #07090f
- Fondo profundo 2: #101524
- Texto principal: #f4f5f8
- Texto secundario: #bec2d0

## Componentes clave
- nf-shell: contenedor general con fondo atmosferico.
- nf-auth-layout: grid responsive para panel promocional + formulario.
- nf-promo-panel: bloque narrativo de valor.
- nf-auth-card: tarjeta principal de formulario.
- nf-input: campo uniforme con enfoque visible.
- nf-button-primary: CTA principal en gradiente rojo.
- nf-button-ghost: CTA secundario translcido.
- nf-chip: etiqueta contextual de fase/modulo.

## Reglas de composicion
1. Mantener maximo dos CTAs primarios por vista.
2. Priorizar lectura en Z: etiqueta -> titulo -> descripcion -> acciones.
3. Mostrar feedback de error cerca del input correspondiente.
4. Mantener transiciones cortas (180ms-450ms) para percepcion de fluidez.

## Responsividad
1. Desktop: layout en dos columnas.
2. Mobile: colapsar a una sola columna, formulario al final.
3. Mantener ancho maximo de contenido para legibilidad.

## Accesibilidad minima
1. Contraste alto entre texto y fondo.
2. Estados de focus visibles en campos y botones.
3. Labels explicitas en todos los inputs.

## Ubicacion tecnica
La implementacion de esta guia se centraliza en minflix-frontend/src/index.css y es consumida por:
- minflix-frontend/src/pages/HomePage.tsx
- minflix-frontend/src/pages/LoginPage.tsx
- minflix-frontend/src/pages/RegisterPage.tsx
