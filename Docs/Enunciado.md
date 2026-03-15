# Proyecto QuindioFlix: Especificaciones y Requerimientos

## 1. Descripción del Proyecto

**QuindioFlix** es una plataforma de streaming de contenido multimedia con operaciones en Colombia. La empresa requiere un sistema de bases de datos robusto que soporte integralmente su modelo de negocio. A continuación, se detallan las operaciones y reglas de negocio, a partir de las cuales se deberán identificar las entidades, relaciones y restricciones necesarias para el modelado de datos.

### 1.1 Gestión del Contenido
La plataforma ofrece un catálogo diverso que incluye películas, series, documentales, música y podcasts. 

**Atributos generales del contenido:**
- Título, año de lanzamiento, duración, sinopsis, clasificación por edad (TP, +7, +13, +16, +18) y fecha de adición al catálogo.
- Indicador de exclusividad (producciones originales de QuindioFlix).

**Clasificación y Organización:**
- **Géneros:** Un contenido puede asociarse a múltiples géneros simultáneamente (e.g., Acción, Comedia, Drama, Suspenso, Romance, Ciencia Ficción, Terror, Documental, Infantil, Musical, entre otros).
- **Tipos de contenido estructurado:** Las series y los podcasts se organizan estructuralmente en temporadas, las cuales a su vez contienen episodios. Las películas son contenido unitario (sin temporadas ni episodios).

**Relaciones entre contenidos:**
- El sistema permite vincular contenidos relacionados, sin importar si son del mismo tipo o no. Esto incluye asociaciones como: secuelas, precuelas, remakes, spin-offs, versiones extendidas, entre otras.

### 1.2 Gestión de Usuarios y Cuentas
El registro de usuarios requiere la recolección de datos personales (nombre, email, teléfono, fecha de nacimiento, ciudad de residencia) y la selección de un plan de suscripción mensual.

**Planes de Suscripción:**
- **Básico:** 1 pantalla simultánea, calidad SD, $14.900/mes. Permite hasta 2 perfiles.
- **Estándar:** 2 pantallas simultáneas, calidad HD, $24.900/mes. Permite hasta 3 perfiles.
- **Premium:** 4 pantallas simultáneas, calidad 4K, $34.900/mes. Permite hasta 5 perfiles.

**Perfiles:**
- Cada cuenta soporta múltiples perfiles, limitados por el plan seleccionado.
- Cada perfil cuenta con nombre, avatar y tipo (adulto o infantil). 
- Los perfiles infantiles tienen restricción de contenido, pudiendo acceder únicamente a clasificaciones TP, +7 y +13.

**Programa de Referidos:**
- Un usuario puede referir a nuevos suscriptores. El sistema debe rastrear estas relaciones (quién refirió a quién) para otorgar beneficios mutuos, como descuentos en la facturación del mes consecutivo tras un registro exitoso.

### 1.3 Reproducciones, Consumo e Interacción
**Historial de Reproducción:**
- Se debe registrar detalladamente cada sesión de visualización por perfil, incluyendo: fecha y hora de inicio, fecha y hora de fin (si la reproducción culmina), dispositivo utilizado (celular, tablet, TV, computador) y porcentaje de avance.
- En el caso de series o podcasts, el registro debe especificar el episodio exacto reproducido.

**Interacción del Usuario:**
- **Favoritos:** Los perfiles pueden añadir contenido a listas personales.
- **Calificaciones y Reseñas:** Posibilidad de puntuar contenidos (de 1 a 5 estrellas) y redactar reseñas.
- **Moderación:** Los usuarios pueden reportar contenido inapropiado. Los moderadores (usuarios con privilegios especiales) se encargan de revisar y resolver estos reportes.

### 1.4 Organización del Equipo de Trabajo
Los empleados de QuindioFlix se estructuran en diferentes departamentos: Tecnología, Contenido, Marketing, Soporte y Finanzas.

**Jerarquía y Responsabilidades:**
- Cada departamento cuenta con un jefe interno.
- Existe una jerarquía de supervisión: un empleado puede supervisar a varios subordinados, pero cada empleado reporta únicamente a un supervisor directo.
- **Departamento de Contenido:** Responsable de la gestión del catálogo. Cada contenido publicado debe tener asignado el empleado que gestionó su publicación.
- **Departamento de Soporte:** Encargado de atender y gestionar los reportes de contenido inapropiado realizados por los usuarios.

### 1.5 Pagos y Facturación
El modelo de cobro es de periodicidad mensual.

**Registro de Transacciones:**
- Cada pago debe registrar: fecha, monto, método de pago (tarjeta de crédito, tarjeta débito, PSE, Nequi, Daviplata) y estado de la transacción (exitoso, fallido, pendiente, reembolsado).
- **Reglas de Facturación y Suspensión:** Si un usuario no realiza el pago dentro de los 30 días posteriores a su fecha de corte, la cuenta se desactiva automáticamente.
- **Descuentos:** Los usuarios con referidos activos reciben automáticamente un descuento configurado en su próximo ciclo de facturación. También existen descuentos por fidelidad (e.g., >12 meses = 10%, >24 meses = 15%).

### 1.6 Reportes y Analítica
El sistema debe soportar inteligencia de negocios mediante la generación de múltiples reportes:
- **Consumo:** Agrupado por ciudad, categoría de contenido, género, dispositivo, plan de suscripción y ventana de tiempo.
- **Financieros:** Ingresos segmentados por ciudad y plan de suscripción.
- **Rendimiento Interno:** Productividad del equipo (ej. volumen de contenido publicado por empleado, cantidad de reportes resueltos por moderador).

---

## 2. Modelo de Negocio y Modelo Conceptual

### 2.1 Modelo de Negocio
El equipo deberá documentar:
1. Actores del sistema y roles correspondientes.
2. Procesos de negocio fundamentales con descripción detallada.
3. Mínimo 10 reglas de negocio derivadas explícita e implícitamente del contexto.
4. Restricciones de dominio clave para la integridad de datos.

### 2.2 Modelo Conceptual (Entidad-Relación)
Diseño de un MER exhaustivo que capture toda la semántica del negocio:
- Identificación de entidades, atributos, tipos de datos y restricciones clave.
- Cardinalidad y participación en las relaciones (binarias, reflexivas, y resoluciones de N:M).
- Aplicación de normalización hasta la Tercera Forma Normal (3FN).
- Diagrama profesional y legible usando herramientas estándar (Data Modeler, draw.io, etc.).

### 2.3 Modelo Físico
Traducción del MER a un script SQL de Oracle:
- Uso de `CREATE TABLE` con restricciones primarias, foráneas, `CHECK`, etc.
- Inserción de un volumen de datos de prueba asimétricos (Sección 4).
- Comentarios descriptivos (`COMMENT ON TABLE/COLUMN`).

---

## 3. Requerimientos de Bases de Datos (Núcleos Temáticos)

### 3.1 Consultas Avanzadas y Almacenamiento
*Objetivo:* Administrar componentes fundamentales mediante consultas complejas.
- **Parametrizadas (3 mín.):** Uso de `&`, `&&`, o `DEFINE` (ej. Top 10 contenido por ciudad, ingresos por fecha, calificaciones por género).
- **Tablas Cruzadas (2 PIVOT, 2 UNPIVOT):** Analítica bidimensional de usuarios, reproducciones y dispositivos.
- **Agrupamientos (4 mín.):** Implementación de `ROLLUP`, `CUBE`, `GROUPING()`, y `GROUPING SETS` en análisis de ingresos y reproducciones.
- **Vistas Materializadas (2 mín.):** Pre-cálculo de ratings de contenido y métricas financieras de facturación.
- **Fragmentación (1 mín.):** Particionamiento (tablespaces/datafiles) de la tabla de Reproducciones por ventanas de tiempo.

### 3.2 Programación PL/SQL
*Objetivo:* Implementar lógica de negocio mediante rutinas almacenadas.
- **Cursores (2 mín.):** Reporte de carteras vencidas (>30 días) y actualización de métricas de popularidad en el catálogo.
- **Procedimientos Almacenados (3 mín.):** Registro integral de usuarios (`SP_REGISTRAR_USUARIO`), gestión de ascensos/descensos de planes (`SP_CAMBIAR_PLAN`), y extracción de resúmenes de consumo (`SP_REPORTE_CONSUMO`).
- **Funciones (2 mín.):** Estimación dinámica de cobros con descuentos (`FN_CALCULAR_MONTO`) y motores de recomendación básica (`FN_CONTENIDO_RECOMENDADO`).
- **Manejo de Excepciones (2 mín.):** Captura de correos duplicados, flujos no válidos de registro y violaciones a límites de perfiles.
- **Disparadores/Triggers (4 mín.):** Bloqueo de reproducciones en cuentas inactivas, control de cuota límite de perfiles por plan, validación de retención (>50%) previa a calificación, y auto-activación de cuenta tras pago exitoso.

### 3.3 Gestión de Transacciones y Concurrencia
*Objetivo:* Asegurar propiedades ACID durante operaciones compuestas.
- **Documentación y Scripting de 3 Transacciones Clave:** 
  1. Registro atómico de Cliente + Plan + Perfil + Pago Inicial.
  2. Facturación masiva de ciclo (con `SAVEPOINT`).
  3. Eliminación en cascada segura (Soft/Hard delete integral de cuenta).
- **Escenario de Concurrencia (1 mín.):** Demostración de control de bloqueos con `SELECT FOR UPDATE` en modificaciones de plan competitivas.

### 3.4 Estrategias de Indexación
*Objetivo:* Optimización demostrable en un caso de uso real.
- **Implementación (4 mín.):** Índices compuestos para historial (Perfil + Fecha), llaves de negocio (Email de usuario), filtros recurrentes (Categoría + Año), y 1 índice adicional a demanda.
- **Análisis de Impacto (1 mín.):** Comparativa de un caso pesado usando `EXPLAIN PLAN` antes y después de indexar.

### 3.5 Privilegios y Seguridad del Acceso
*Objetivo:* Segregación del acceso a los datos vía perfiles, roles y usuarios en Oracle.
- **Perfiles de Seguridad (PROFILE):** Límite de sesiones concurrentes e inactividad.
- **Roles y Permisos:** `ROL_ADMIN`, `ROL_ANALISTA`, `ROL_SOPORTE`, `ROL_CONTENIDO`.
- **Demostración:** Asignación estructurada (`GRANT`) y prueba de falla ante accesos no autorizados.

---

## 4. Requisitos de Datos de Prueba (Población)

Para garantizar resultados funcionales en análisis (CUBE, PIVOT), la información base **debe ser asimétrica y realista**, con los siguientes umbrales sugeridos:
- **Catálogos base:** 3 Planes, 5 Categorías, 8+ Géneros.
- **Población media:** 30 Usuarios, 50 Perfiles, 40 Contenidos, 15 Temporadas, 50 Episodios.
- **Transaccionalidad:** 200 Reproducciones (variadas históricamente), 60 Calificaciones, 80 Pagos (históricos), 40 Favoritos.

---

## 5. Entregables

El proyecto se entrega como un único paquete con los siguientes 10 componentes:

1. **Documento de modelo de negocio:** actores, procesos, reglas de negocio (mínimo 10), restricciones del dominio. (Word o PDF)
2. **Modelo Entidad-Relación (MER):** completo y profesional. (Imagen PNG o PDF)
3. **Script de creación de tablas:** con restricciones y comentarios. (Archivo .sql)
4. **Script de inserción de datos:** datos de prueba asimétricos. (Archivo .sql)
5. **Script de consultas avanzadas (Núcleo 1):** parametrizadas, PIVOT, UNPIVOT, ROLLUP, CUBE, GROUPING SETS, vistas materializadas, fragmentación. (Archivo .sql)
6. **Script de PL/SQL (Núcleo 2):** cursores, procedimientos, funciones, excepciones, disparadores. (Archivo .sql)
7. **Script de transacciones (Núcleo 3):** especificación y demostración de las 3 transacciones + escenario de concurrencia. (Archivo .sql)
8. **Script de índices (Núcleo 4):** creación + análisis `EXPLAIN PLAN` con capturas. (Archivo .sql + capturas)
9. **Script de usuarios y roles (Núcleo 5):** creación de roles, usuarios, `GRANT`, demostración. (Archivo .sql)
10. **Documento de sustentación:** justificación de decisiones de diseño, análisis de índices, escenario de concurrencia. (Word o PDF, máximo 10 páginas)

---

## 6. Criterios de Evaluación

- **NT1: Consultas avanzadas (25%):** Consultas parametrizadas funcionan correctamente. PIVOT/UNPIVOT generan reportes legibles. ROLLUP/CUBE/GROUPING SETS correctos. Vistas materializadas funcionan. Fragmentación justificada.
- **NT2: PL/SQL (30%):** Cursores recorren datos correctamente. Procedimientos validan reglas de negocio. Funciones retornan valores correctos. Excepciones se manejan apropiadamente. Triggers cumplen las reglas.
- **NT3: Transacciones (15%):** Transacciones usan COMMIT/ROLLBACK/SAVEPOINT correctamente. Escenario de concurrencia está documentado y demostrado.
- **NT4: Índices (10%):** Índices creados con justificación. Análisis `EXPLAIN PLAN` muestra mejora.
- **NT5: Usuarios y roles (10%):** Roles diferenciados. Privilegios correctos. Demostración de restricción de acceso.
- **Calidad general (10%):** Modelo de datos bien diseñado. Datos de prueba asimétricos. Scripts organizados y comentados. Documento de sustentación claro.

---

## 7. Reglas Generales

1. El proyecto se realiza en grupos de 2 a 3 estudiantes.
2. Todos los scripts deben ejecutarse sin errores en Oracle (SQL Developer o SQL*Plus).
3. Cada script debe estar comentado explicando qué hace cada sección.
4. Los datos de prueba deben ser coherentes (no inventar datos que rompan las restricciones de integridad).
5. El proyecto se sustenta en clase. Todos los integrantes del grupo deben poder explicar cualquier parte del proyecto.
6. Se evaluará tanto el funcionamiento como la comprensión. Un script que funciona pero que el estudiante no sabe explicar, no obtiene la nota completa.
7. Se permite consultar documentación oficial de Oracle, libros y material del curso. No se permite copiar de otros grupos.
8. La entrega es en la fecha establecida por el docente. Entregas tardías tienen penalización según el reglamento de la universidad.

---

## 8. Cronograma Sugerido

El proyecto se trabaja en paralelo con las clases. A medida que se avanza en cada núcleo temático, los estudiantes aplican lo aprendido al proyecto:

- **Semana 1-3:** Repaso BD I + Consultas avanzadas (Diseñar MER, crear tablas, insertar datos, consultas parametrizadas).
- **Semana 4-5:** PIVOT, UNPIVOT, ROLLUP, CUBE (Implementar reportes cruzados y con subtotales).
- **Semana 6:** Vistas materializadas, fragmentación (Crear vistas materializadas y fragmentar tabla REPRODUCCIONES).
- **Semana 7-9:** PL/SQL: cursores, procedimientos, funciones (Implementar SP, funciones y cursores del proyecto).
- **Semana 10-11:** PL/SQL: triggers, excepciones (Implementar triggers y manejo de excepciones).
- **Semana 12-13:** Transacciones y concurrencia (Diseñar e implementar las 3 transacciones + escenario concurrencia).
- **Semana 14:** Índices (Crear índices, hacer análisis `EXPLAIN PLAN`).
- **Semana 15:** Usuarios y roles (Implementar esquema de seguridad).
- **Semana 16:** Entrega y sustentación (Entrega final + sustentación oral).
