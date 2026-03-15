# Plan de Desarrollo del Proyecto QuindioFlix

Este plan de desarrollo detalla el paso a paso para la construcción de la base de datos de QuindioFlix, basándose en los requerimientos (enunciado) y las épicas definidas. El plan está diseñado para ejecutarse de manera iterativa e incremental, organizado en fases (Sprints) que se alinean con los núcleos temáticos y el cronograma sugerido.

---

## Fase 1: Análisis y Modelado Conceptual (Semanas 1-2)
**Objetivo:** Comprender el negocio y diseñar la estructura lógica de los datos.
**Épicas involucradas:** Épica 1, Épica 2, Épica 4, Parte de la Épica 5.

**Pasos detallados:**
1. **Definición del Documento de Negocio:**
   - Identificar a los actores principales (Usuario, Moderador, Empleado de Contenido, Empleado de Soporte, Finanzas).
   - Documentar los procesos estrella: Gestión de Catálogo, Registro de Clientes, Ciclo de Facturación.
   - Definir al menos 10 reglas de negocio (ej. Límite de vistas infantiles a clasificaciones TP, +7, +13; Límite de perfiles según plan).
   - Establecer restricciones de dominio (ej. estrellas entre 1 y 5).
2. **Diseño del Modelo Entidad-Relación (MER):**
   - Modelar entidades maestras: `Planes`, `Usuarios`, `Perfiles`, `Categorías`, `Géneros`, `Contenido`, `Empleados`, `Departamentos`.
   - Modelar entidades transaccionales e intermedias: `Reproducciones`, `Calificaciones`, `Pagos`, `Favoritos`, `Contenidos_Relacionados` (reflexiva), `Reportes`.
   - Validar relaciones "Supervisores" (jerarquía reflexiva en Empleados).
   - Normalizar el modelo hasta la 3FN, garantizando eficiencia para consultas.
3. **Revisión Continua:** Validar el MER con las reglas del documento de negocio antes de pasar a su implementación física.

---

## Fase 2: Implementación Estructural y Población de Datos (Semanas 3-4)
**Objetivo:** Llevar el modelo de diseño al gestor Oracle y cargar información transaccional asimétrica.

**Pasos detallados:**
1. **Script DDL (Creación de Tablas):**
   - Escribir en SQL los `CREATE TABLE` aplicando restricciones de Primary Key, Foreign Key y Checks (ej. check de estado `exitoso, fallido, pendiente, reembolsado` en Pagos).
   - Ejecutar la fragmentación/particionamiento solicitada en la tabla `REPRODUCCIONES` y ubicarla en distintos tablespaces o datafiles.
   - Documentar con comandos `COMMENT` todas las tablas y columnas creadas.
2. **Script DML (Datos de Prueba):**
   - Insertar la data base y transaccional masiva (mínimos exigidos: 30 usuarios, 200 reproducciones, 80 pagos, etc.).
   - Asegurarse de mantener asimetría: diferentes distribuciones de planes, cruces desiguales para que el análisis de consultas matriciales evidencie discrepancias (no todos los usuarios en el mismo plan ni de la misma ciudad).

---

## Fase 3: Análisis Descriptivo y Consultas Avanzadas (Semana 5-6)
**Objetivo:** Dar soporte al núcleo de toma de decisiones e inteligencia empresarial de la gerencia.
**Épica involucrada:** Épica 6.

**Pasos detallados:**
1. **Construcción de tableros de control paramétricos:**
   - Utilizar scripts que usen variables `&`, `&&` y `DEFINE` sobre contenido top, ingresos segmentados, etc.
2. **Matrices de cruce complejo (PIVOT y UNPIVOT):**
   - Crear el reporte pivoteado 1: Ciudades como filas vs. Planes en columnas (Cantidad usuarios activos).
   - Crear el reporte pivoteado 2: Categorías vs. Dispositivos (Suma de Reproducciones).
   - Aplicar `UNPIVOT` sobre estructuras estáticas cruzadas o salidas temporales.
3. **Uso de Agrupamientos Especializados:**
   - Construir consultas de agregación analítica con `ROLLUP` (ventas con subtotales por ciudad) y `CUBE` (todas las combinaciones posibles en reproducciones).
   - Emplear `GROUPING()` para manejar nulos adecuadamente y `GROUPING SETS`.
4. **Vistas Materializadas:**
   - Generar la vista para pre-calcular ingresos mensuales.
   - Generar la vista para almacenar la calificación promedio del contenido.

---

## Fase 4: Lógica de Negocio en Base de Datos - PL/SQL (Semanas 7-11)
**Objetivo:** Desarrollar el core operacional (Registro, Cambio de Planes, Validaciones automáticas).
**Épicas involucradas:** Épicas 1, 2, 3, 4, 5.

**Pasos detallados:**
1. **Programación de Procedimientos (Procesos pesados):**
   - Construir `SP_REGISTRAR_USUARIO`, implementando validación de email directo y alta en serie de cuenta y pago base. Incluir lógica de manejo de excepciones para duplicados o falla transaccional.
   - Construir `SP_CAMBIAR_PLAN`, protegiendo el modelo ante descensos de categoría (downgrade) si el número de perfiles activos del usuario excede el límite del plan menor.
   - Programar iteradores (`cursores`) masivos para la identificación de carteras vencidas después de 30 días y actualizaciones de estado de popularidad basadas en visionados completos (>90%).
2. **Programación de Funciones (Cálculos dinámicos):**
   - Función para cálculo del próximo monto de facturación sumando descuentos por referidos y años de fidelidad (+12 o +24 meses).
   - Función básica paramétrica de afinidad/recomendación por perfiles (favoritos y más vistos combinados).
3. **Disparadores - Triggers (Reglas automáticas y restricciones):**
   - Bloquear nuevas filas en *Reproducciones* si el usuario dueño está inactivo.
   - Bloquear nuevas inserciones en *Perfiles* cuando se alcanza el tope según plan asociado (Basic 2, etc.).
   - Impedir reseñas (*Calificaciones*) de contenido cuya reproducción no acumule más de un 50% de avance.
   - Reestablecer estado_cuenta = 'ACTIVO' luego del `INSERT` de un pago exitoso.

---

## Fase 5: Concurrencia y Transaccionalidad (Semanas 12-13)
**Objetivo:** Blindar la base de datos contra choques funcionales bajo estado productivo de múltiples concurrentes y controlar el ciclo ACID.

**Pasos detallados:**
1. **Especificación Estructural de Transacciones:**
   - Diagramar flujos confirmables y prever la ruta de aborto en a) El registro completo, b) Transacción masiva de facturación mensual haciendo uso forzoso de `SAVEPOINT`, c) La eliminación del cliente y su rastro con cascadas de borrado atómico.
2. **Verificación de Escenarios de Concurrencia:**
   - Crear script emulador: Dos hilos atacando el update de plan del mismo ID de Usuario en franjas milimétricas. Resolver colisión agregando `SELECT FOR UPDATE` para evitar condiciones de carrera.

---

## Fase 6: Optimización de Consultas - Índices (Semana 14)
**Objetivo:** Generar mejoras de rendimiento comprobables en búsquedas.
**Épica involucrada:** Épica 3 y Épica 6.

**Pasos detallados:**
1. **Construcción y Justificación Criteriosa:**
   - Implementar los índices funcionales: Histórico (`id_perfil, fecha`), validación (`email`), Catálogo (`categoria, anio`). Un cuarto índice personal sobre columnas de alta cardinalidad o JOINs usados (ej: `estado_cuenta`).
2. **Auditoría Performante:**
   - Realizar la traza de impacto. Ejecutar un select sumatorio masivo previo y posterior al índice y extraer el `EXPLAIN PLAN` para demostrar ahorro costo/tiempo.

---

## Fase 7: Seguridad y Administración de Acceso (Semana 15)
**Objetivo:** Limitar la visualización y manipulación de datos acorde a las funciones corporativas.

**Pasos detallados:**
1. **Perfiles Dinámicos de Acceso (PROFILE):**
   - Implementar control a base de datos delimitando el máximo de sesiones en paralelo y lock por reintentos o inactividad temporizada.
2. **Modelo de Roles Específicos:**
   - Crear roles definidos por enunciado: `ROL_ADMIN` (Sin restricciones), `ROL_ANALISTA` (Solo Selects, Views), `ROL_SOPORTE` (Solo CRUD de Usuarios, Pagos), y `ROL_CONTENIDO` (Solo CRUD de catálogo, Select de stats).
3. **Distribución de Roles y QA:**
   - Crear cuentas genéricas (`C_USER_1`, etc.), heredar roles respectivos mediante el uso estricto y exacto de `GRANT`, e intentar forzar fallos por denegación (ej: Usuario Contenido intentando borrar un Pago) como mecanismo probatorio.

---

## Fase 8: Consolidación y Preparación de Sustentación (Semana 16)
**Objetivo:** Ensamblado final unificado para el docente y repaso.

**Pasos detallados:**
1. Extracción completa y organización de Scripts (Limpios, tabulados y comentados en cabeceras).
2. Generar el documento global recopilatorio donde conste: MER HD, casos teóricos evaluados, justificación analítica de los índices elaborados e historiales/screenshots de transacciones.
3. Simulacros de equipo (Sustentación): Todos los miembros deberán poder exponer la lógica detrás y el flujo PL/SQL del sistema diseñado y evidenciar funcionalidad.
