# Guia de Diseno UI - Fase 1 (Auth)

## Objetivo visual
Construir una experiencia de autenticacion estilo plataforma de streaming premium: alto contraste, jerarquia tipografica fuerte y enfoque en conversion (login/registro).

## Tipografia oficial
- Principal UI: Helvetica Neue, Helvetica, Arial, sans-serif.
- Uso: titulos, labels, botones, ayudas de formulario y tarjetas de planes.

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
- nf-hero-wrap: contenedor principal de vista inicial y planes.
- nf-auth-layout: grid responsive para panel promocional + formulario.
- nf-promo-panel: bloque narrativo de valor.
- nf-auth-card: tarjeta principal de formulario.
- nf-input: campo uniforme con enfoque visible.
- nf-password-wrap + nf-password-toggle: campo reutilizable con ver/ocultar contrasena (usando iconos Eye y EyeOff de Lucide).
- nf-helper-field: texto explicativo bajo campos sensibles o ambiguos.
- nf-button-primary: CTA principal en gradiente rojo.
- nf-button-ghost: CTA secundario translcido.
- nf-chip: etiqueta contextual de fase/modulo.

## Feedback y Alertas
1. **Mensajes de Confirmacion / Error:** No se deben usar alertas nativas del navegador (window.alert). Todo feedback debe manejarse mediante **React Hot Toast**, en la esquina superior derecha, con los colores oscuros de la paleta.
2. **Iconografia:** El icono de visualizacion para la contraseña sera siempre un ojo (`Eye` / `EyeOff`) extraido de `lucide-react`.

## Flujo de navegacion autenticado
1. El Home inicial (`/`) se mantiene como landing publica.
2. Tras login o registro exitoso, el usuario va a `profiles/select` para elegir perfil.
3. La vista `profiles/select` replica el flujo Netflix "Quien esta viendo" y no retorna al landing mientras haya sesion activa.
4. Luego de seleccionar perfil, el usuario entra a `browse`.

## Carga de avatar desde explorador de archivos
1. El formulario de gestion de perfiles usa input `type=file` para abrir el explorador del sistema.
2. Solo se aceptan archivos de imagen (`image/*`) y maximo 5MB.
3. El backend recibe la imagen por `multipart/form-data` en `/auth/profiles/avatar` y retorna URL publica.
4. El frontend guarda esa URL en el perfil al crearlo o actualizarlo.

## Helpers funcionales
1. authFieldHelp: glosario corto para explicar campos de login/registro.
2. plansCatalog: catalogo de planes y beneficios para la vista de comparacion.
3. profileHelperNotes: aclaraciones sobre el concepto de perfil inicial.

### Definicion de perfil inicial
Perfil inicial es el primer perfil de reproduccion creado dentro de la cuenta al registrarse.
Sirve para separar historial, recomendaciones y progreso desde el primer ingreso.

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
- minflix-frontend/src/pages/ProfileSelectorPage.tsx
- minflix-frontend/src/pages/BrowsePage.tsx
- minflix-frontend/src/pages/LoginPage.tsx
- minflix-frontend/src/pages/RegisterPage.tsx
- minflix-frontend/src/pages/ProfilesPage.tsx
- minflix-frontend/src/shared/ui/PasswordInput.tsx
- minflix-frontend/src/shared/helpers/authFieldHelp.ts
- minflix-frontend/src/shared/helpers/plansCatalog.ts
