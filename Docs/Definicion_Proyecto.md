# QUINDIOFLIX
## Documento de Definición del Proyecto (DP) - Versión 1.0

**Preparado por:**
* Juan Sebastián Noreña Espinosa
* Daniel Eduardo Jurado Celemín
* Samuel Andrés Castaño

**Institución:** Universidad del Quindío
**Facultad:** Facultad de Ingeniería de Sistemas y Computación
**Ubicación:** Armenia - Quindío
**Año:** 2026

### Historial de Revisiones
* **30/04/2026 (Versión 1.0):** Elaboración de la 1er parte. Autores: Juan Sebastián Noreña Espinosa, Daniel Eduardo Jurado Celemín, Samuel Andrés Castaño.

---

## 1. Descripción de la Empresa y Reglas de Negocio

MinFlix (QuindioFlix) se consolida como una de las plataformas de streaming de contenido multimedia más innovadoras operando en Colombia. La empresa tiene como objetivo principal brindar entretenimiento ininterrumpido y altamente personalizado a sus usuarios mediante un extenso catálogo que incluye películas, series, documentales, música y podcasts. 

El modelo de operación de MinFlix se sustenta en un esquema de suscripción estructurado y en un riguroso conjunto de directrices que garantizan la viabilidad financiera, la seguridad de los usuarios y la calidad del servicio. A continuación, se explican las políticas y reglas de negocio fundamentales que rigen la operación de la empresa:

En primer lugar, la estructura de membresías define los límites operativos de las cuentas. **(1) Regla de Planes y Límites de Perfiles:** MinFlix maneja tres niveles de suscripción (Básico, Estándar y Premium). Dependiendo del plan adquirido, se restringe tanto la cantidad máxima de pantallas simultáneas como el número de perfiles permitidos por cuenta, permitiendo exactamente 2 perfiles en el plan Básico, 3 en el Estándar y un máximo de 5 en el Premium. 

Para garantizar una experiencia a medida, **(2) Regla de Aislamiento de Perfiles:** la plataforma exige que toda reproducción, lista de favoritos y calificación esté estrictamente ligada a un perfil individual dentro de la cuenta matriz, impidiendo que el historial de consumo de un miembro de la familia contamine las recomendaciones generadas algorítmicamente para los demás. Además, con un fuerte compromiso hacia el control parental, se establece la **(3) Regla de Restricción Etaria:** aquellos perfiles que se marquen como infantiles o para menores de edad tienen un bloqueo estricto a nivel de base de datos que les impide visualizar o buscar cualquier contenido que no esté clasificado explícitamente para todo público (TP), mayores de 7 años (+7) o mayores de 13 años (+13).

En cuanto a la interacción de los usuarios con el contenido, MinFlix fomenta la participación pero bajo condiciones de veracidad. **(4) Regla de Condición para Calificar:** Un perfil únicamente está habilitado para otorgar una calificación (de 1 a 5 estrellas) o redactar una reseña sobre una película, serie o podcast si el sistema ha registrado un consumo efectivo igual o superior al 50% de la duración total del contenido, evitando así manipulaciones en la puntuación o *review bombing*. Asimismo, **(5) Regla de Trazabilidad de Reproducción:** el sistema de MinFlix tiene la obligación técnica de registrar cada intento de reproducción con su porcentaje exacto de avance, dispositivo y marca de tiempo, garantizando que el usuario pueda retomar su contenido en cualquier momento exactamente en el segundo donde lo dejó.

A nivel financiero, la empresa opera con una política estricta pero que premia la fidelidad. **(6) Regla de Facturación y Morosidad:** El cobro de las suscripciones se ejecuta de manera automática mensualmente. Si un usuario presenta un fallo en el pago, se le otorga un periodo de gracia de máximo 30 días; transcurrido este tiempo sin regularizar el pago, el estado de la cuenta pasa inmediatamente a estar inactiva, bloqueando el acceso a todos los perfiles asociados. Sin embargo, para los usuarios leales aplica la **(7) Regla de Descuento por Antigüedad:** el sistema de facturación debe aplicar un 10% de descuento automático en la mensualidad a las cuentas que superen los 12 meses continuos de suscripción activa, y un 15% de descuento a las que mantengan una actividad ininterrumpida por más de 24 meses. Como incentivo de crecimiento, la empresa también promueve la **(8) Regla de Referidos:** los suscriptores pueden referir nuevos usuarios a la plataforma; si el usuario referido completa satisfactoriamente su proceso de pago y suscripción, el usuario referente adquiere un descuento aplicable a su próxima facturación.

Finalmente, a nivel administrativo y operativo interno, MinFlix delega responsabilidades claras sobre su personal. **(9) Regla de Autoría de Publicación:** Todo elemento multimedia que ingrese al catálogo público de MinFlix debe tener asociado obligatoriamente el identificador de un empleado específico del departamento de Contenido, quien será el único responsable directo de su publicación y metadatos. Y para salvaguardar las interacciones de la comunidad, aplica la **(10) Regla de Moderación Comunitaria:** cualquier reporte levantado por un usuario sobre contenido inapropiado o reseñas ofensivas debe ser escalado y asignado de manera obligatoria a un empleado con el rol de Moderador en el departamento de Soporte, quien tiene la autoridad para eliminar las reseñas y penalizar perfiles.

---

## 2. Modelo de negocio y modelo conceptual

### 2.1 Modelo de negocio
El modelo relacional de MinFlix contiene las siguientes entidades principales:

#### ENTIDADES CORE:
* **PLANES:** Define planes de suscripción (Básico, Estándar, Premium) con precio y límite de perfiles.
* **USUARIOS:** Cuenta de suscriptor con datos personales, plan, estado, rol.
* **PERFILES:** Perfil dentro de una cuenta (adulto/infantil) con avatar y tipo.
* **CONTENIDOS:** Películas, series, documentales, música, podcasts con metadatos (título, año, duración, clasificación edad, tipo).
* **CATEGORIAS:** Categorización de contenido (Películas, Series, Documentales, Música, Podcasts).
* **GENEROS:** Géneros disponibles con relación N:M a CONTENIDOS.
* **TEMPORADAS:** Temporadas de series/podcasts.
* **EPISODIOS:** Episodios dentro de temporadas.

#### ENTIDADES DE REPRODUCCIÓN Y CONSUMO:
* **REPRODUCCIONES:** Registra cada reproducción (perfil, contenido, fecha, dispositivo, porcentaje avance, estado).
* **FAVORITOS:** Relación N:M entre PERFILES y CONTENIDOS.
* **CALIFICACIONES:** Puntuación y reseña de perfil sobre contenido (solo si avance ≥50%).

#### ENTIDADES FINANCIERAS:
* **PAGOS:** Registro de cada transacción (usuario, monto, método, estado, fecha).
* **FACTURACIONES:** Resumen mensual de cobro (período, monto base, descuentos, monto final, estado).
* **REFERIDOS:** Relación N:N entre usuarios (referente → referido) con estado y descuento.

#### ENTIDADES DE MODERACIÓN:
* **REPORTES:** Reporte de contenido inapropiado (usuario, contenido, detalle, estado, moderador asignado).

#### ENTIDADES ORGANIZACIONALES:
* **EMPLEADOS:** Personal de MinFlix (nombre, departamento, rol, supervisor).
* **DEPARTAMENTOS:** Tecnología, Contenido, Marketing, Soporte, Finanzas.

#### RELACIONES REFLEXIVAS:
* `EMPLEADOS.supervisor_id` → `EMPLEADOS.id` (jerarquía de supervisión)
* `CONTENIDOS.id_contenido_relacionado` → `CONTENIDOS.id` (secuelas, remakes, spin-offs)

#### CARDINALIDADES CLAVE:
* Usuario → Perfiles: 1:N (1 usuario, muchos perfiles según plan)
* Plan → Usuarios: 1:N
* Contenido → Reproducciones: 1:N
* Perfil → Reproducciones: 1:N
* Perfil → Favoritos: N:M con CONTENIDOS
* Perfil → Calificaciones: N:M con CONTENIDOS
* Contenido → Géneros: N:M
* Contenido → Categoría: N:1

#### NORMALIZACIÓN: 3FN Y JUSTIFICACIÓN DE DECISIONES DE DISEÑO
El esquema físico se implementó con un fuerte enfoque en normalización (3FN) y separación de responsabilidades para garantizar rendimiento OLTP. A continuación se justifican las principales decisiones de diseño adoptadas en los scripts DDL:

1. **Separación Estricta entre `USUARIOS` y `PERFILES`:**
   En lugar de tener atributos de perfil mezclados en la tabla de cuenta, se decidió aislar `PERFILES` en una relación 1:N. Esto permite que el límite de perfiles sea dinámico (gobernado por la tabla `PLANES`) e implementado a nivel de triggers, evitando anomalías de actualización. La cuenta (`USUARIOS`) es dueña de la facturación, mientras que los `PERFILES` son dueños del consumo.

2. **Tipado Fuertemente Acoplado a Roles:**
   La tabla `USUARIOS` maneja una columna `ROL` y `ESTADO_CUENTA`, mientras que los `PERFILES` manejan `TIPO_PERFIL` (adulto/infantil). Esta decisión simplificó dramáticamente los controles de acceso a contenido sensible a través del cruce en las consultas, garantizando de forma nativa desde base de datos que el contenido +18 no se liste a perfiles infantiles.

3. **Uso de IDs Sintéticos Autoincrementales:**
   Para todas las entidades core (ej. `ID_USUARIO`, `ID_REPRODUCCION`) se utilizaron columnas `NUMBER` autogeneradas (Identity columns introducidas en Oracle 12c+), en lugar de claves naturales como el email. Esta decisión facilita sobremanera los JOINs pesados y previene caídas de rendimiento durante actualizaciones en cascada.

---

## 3. Requerimientos del proyecto
El proyecto debe cubrir los 5 núcleos temáticos del curso. A continuación se detallan los requerimientos para cada uno.

### 3.1 Núcleo 1: Consultas avanzadas y almacenamiento
**Resultado de aprendizaje:** R.A.1 — Administrar componentes fundamentales de una solución de BD

#### 3.1.1 Consultas parametrizadas (mínimo 3)
Implementamos consultas parametrizadas (usando `DEFINE` y `&&`) en el archivo **`database/17_analitica_nt1.sql`** (Sección C) para resolver problemas analíticos de forma interactiva.

**a) Consulta que reciba una ciudad y muestre el top 10 de contenido mas reproducido en esa ciudad:**
Esta consulta utiliza las variables `&&ciudad` y `&&limite` para filtrar las reproducciones de usuarios que residen en una ciudad específica, agrupando por contenido y categoría para mostrar los más populares.
```sql
DEFINE ciudad = 'Bogota'
DEFINE limite = 10

SELECT *
FROM (
  SELECT
    C.TITULO,
    C.TIPO_CONTENIDO,
    CAT.NOMBRE                       AS CATEGORIA,
    COUNT(R.ID_REPRODUCCION)         AS TOTAL_REPRODUCCIONES,
    ROUND(AVG(R.PORCENTAJE_AVANCE), 2) AS PROMEDIO_AVANCE_PCT
  FROM REPRODUCCIONES R
  JOIN PERFILES P ON P.ID_PERFIL = R.ID_PERFIL
  JOIN USUARIOS U ON U.ID_USUARIO = P.ID_USUARIO
  JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
  JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
  WHERE UPPER(U.CIUDAD_RESIDENCIA) = UPPER('&&ciudad')
  GROUP BY C.TITULO, C.TIPO_CONTENIDO, CAT.NOMBRE
  ORDER BY TOTAL_REPRODUCCIONES DESC
)
WHERE ROWNUM <= &&limite;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**b) Consulta que reciba un mes y año y muestre los ingresos por plan de suscripción en ese período:**
Utiliza parámetros `&&fecha_inicio` y `&&fecha_fin` para filtrar las facturaciones en un rango dado. Agrupa los ingresos (diferenciando cobrados y pendientes) por año y mes.
```sql
DEFINE fecha_inicio = '2025-01-01'
DEFINE fecha_fin    = '2025-12-31'

SELECT
  F.PERIODO_ANIO,
  F.PERIODO_MES,
  COUNT(F.ID_FACTURACION) AS TOTAL_FACTURAS,
  SUM(F.MONTO_FINAL)      AS INGRESOS_TOTALES,
  SUM(
    CASE WHEN F.ESTADO_FACTURA = 'PAGADA'
         THEN F.MONTO_FINAL ELSE 0 END
  )                       AS INGRESOS_COBRADOS,
  SUM(
    CASE WHEN F.ESTADO_FACTURA IN ('PENDIENTE', 'VENCIDA')
         THEN F.MONTO_FINAL ELSE 0 END
  )                       AS INGRESOS_POR_COBRAR
FROM FACTURACIONES F
WHERE F.FECHA_CORTE BETWEEN TO_DATE('&&fecha_inicio', 'YYYY-MM-DD') AND TO_DATE('&&fecha_fin', 'YYYY-MM-DD')
GROUP BY F.PERIODO_ANIO, F.PERIODO_MES
ORDER BY F.PERIODO_ANIO, F.PERIODO_MES;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**c) Consulta que reciba un género y muestre la calificación promedio por categoría para ese género:**
Recibe el parámetro `&&genero` para filtrar los contenidos de un género en específico, calculando el puntaje promedio, máximo y mínimo otorgado por los usuarios.
```sql
DEFINE genero = 'Drama'

SELECT
  C.TITULO,
  C.TIPO_CONTENIDO,
  CAT.NOMBRE             AS CATEGORIA,
  ROUND(AVG(CAL.PUNTAJE), 2) AS PROMEDIO_PUNTAJE,
  COUNT(CAL.ID_CALIFICACION) AS TOTAL_CALIFICACIONES,
  MIN(CAL.PUNTAJE)       AS PUNTAJE_MIN,
  MAX(CAL.PUNTAJE)       AS PUNTAJE_MAX
FROM CALIFICACIONES CAL
JOIN CONTENIDOS C ON C.ID_CONTENIDO = CAL.ID_CONTENIDO
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
JOIN CONTENIDOS_GENEROS CG ON CG.ID_CONTENIDO = C.ID_CONTENIDO
JOIN GENEROS G ON G.ID_GENERO = CG.ID_GENERO
WHERE UPPER(G.NOMBRE) = UPPER('&&genero')
GROUP BY C.TITULO, C.TIPO_CONTENIDO, CAT.NOMBRE
ORDER BY PROMEDIO_PUNTAJE DESC;
```
*Ubicación: `database/17_analitica_nt1.sql`*

#### 3.1.2 Tablas de referencias cruzadas — PIVOT y UNPIVOT
Desarrollamos tablas cruzadas para girar datos en matrices bidimensionales, lo cual sería muy complejo usando simples `GROUP BY`.

**a) PIVOT: Generar un reporte donde las filas sean las ciudades y las columnas sean los planes de suscripción, mostrando la cantidad de usuarios activos por cada combinación:**
Gira la tabla de usuarios para contar cuántos tienen cada plan en las distintas ciudades de residencia.
```sql
SELECT *
FROM (
  SELECT
    U.CIUDAD_RESIDENCIA  AS CIUDAD,
    PL.NOMBRE            AS PLAN
  FROM USUARIOS U
  JOIN PLANES PL ON PL.ID_PLAN = U.ID_PLAN
  WHERE U.ESTADO_CUENTA = 'ACTIVO'
)
PIVOT (
  COUNT(*)
  FOR PLAN IN (
    'Básico'   AS BASICO,
    'Estándar' AS ESTANDAR,
    'Premium'  AS PREMIUM
  )
)
ORDER BY CIUDAD;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**b) PIVOT: Reporte de reproducciones donde las filas sean las categorías y las columnas sean los dispositivos, mostrando el total de reproducciones:**
Transforma los registros de reproducción para ver cómo se distribuye el consumo de cada categoría en los diferentes dispositivos.
```sql
SELECT *
FROM (
  SELECT
    CAT.NOMBRE AS CATEGORIA,
    NVL(R.ULTIMO_DISPOSITIVO, 'Sin dispositivo') AS DISPOSITIVO,
    R.ID_REPRODUCCION
  FROM REPRODUCCIONES R
  JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
  JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
)
PIVOT (
  COUNT(ID_REPRODUCCION)
  FOR DISPOSITIVO IN (
    'Celular'    AS CELULAR,
    'Tablet'     AS TABLET,
    'TV'         AS TV,
    'Computador' AS COMPUTADOR
  )
)
ORDER BY CATEGORIA;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**c) UNPIVOT: Tomar un reporte pivoteado y convertirlo de nuevo en filas para análisis detallado:**
Desnormaliza la vista de métricas financieras para convertir las columnas `INGRESOS_COBRADOS` e `INGRESOS_PENDIENTES` en una sola columna con una etiqueta descriptiva.
```sql
SELECT PLAN, PERIODO_ANIO, PERIODO_MES, TIPO_INGRESO, MONTO
FROM MV_METRICAS_FINANCIERAS
UNPIVOT (
  MONTO
  FOR TIPO_INGRESO IN (
    INGRESOS_COBRADOS   AS 'COBRADO',
    INGRESOS_PENDIENTES AS 'PENDIENTE'
  )
)
WHERE MONTO > 0
ORDER BY PLAN, PERIODO_ANIO, PERIODO_MES, TIPO_INGRESO;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**d) UNPIVOT: Convertir una tabla de resumen que tenga columnas de meses (enero, febrero, marzo...) en filas individuales:**
Desnormaliza un resultado pivoteado de reproducciones por mes revirtiendo las columnas de meses de nuevo a un formato relacional de filas.
```sql
SELECT DISPOSITIVO, MES_NOMBRE, TOTAL_REPRODUCCIONES
FROM (
  SELECT *
  FROM (
    SELECT
      NVL(R.ULTIMO_DISPOSITIVO, 'Sin dispositivo') AS DISPOSITIVO,
      EXTRACT(MONTH FROM R.FECHA_INICIO)            AS MES,
      R.ID_REPRODUCCION
    FROM REPRODUCCIONES R
  )
  PIVOT (
    COUNT(ID_REPRODUCCION)
    FOR MES IN (
      1 AS MES_1, 2 AS MES_2, 3 AS MES_3, 4 AS MES_4, 5 AS MES_5, 6 AS MES_6,
      7 AS MES_7, 8 AS MES_8, 9 AS MES_9, 10 AS MES_10, 11 AS MES_11, 12 AS MES_12
    )
  )
)
UNPIVOT (
  TOTAL_REPRODUCCIONES
  FOR MES_NOMBRE IN (
    MES_1, MES_2, MES_3, MES_4, MES_5, MES_6,
    MES_7, MES_8, MES_9, MES_10, MES_11, MES_12
  )
)
WHERE TOTAL_REPRODUCCIONES > 0
ORDER BY DISPOSITIVO, MES_NOMBRE;
```
*Ubicación: `database/17_analitica_nt1.sql`*

#### 3.1.3 Funciones avanzadas del GROUP BY
Aplicamos agrupaciones jerárquicas como `ROLLUP`, `CUBE`, `GROUPING()` y `GROUPING SETS` para calcular múltiples subtotales en una sola pasada a disco.

**a) ROLLUP: Reporte de ingresos por ciudad y plan de suscripción con subtotales por ciudad y gran total:**
Genera los niveles de agregación jerárquica para la facturación, calculando el total recaudado en una ciudad por plan, luego el subtotal de la ciudad, y finalmente el gran total global.
```sql
SELECT
  U.CIUDAD_RESIDENCIA,
  PL.NOMBRE AS PLAN,
  SUM(F.MONTO_FINAL) AS INGRESOS_TOTALES,
  COUNT(F.ID_FACTURACION) AS TOTAL_FACTURAS
FROM FACTURACIONES F
JOIN USUARIOS U ON U.ID_USUARIO = F.ID_USUARIO
JOIN PLANES PL ON PL.ID_PLAN = U.ID_PLAN
GROUP BY ROLLUP(U.CIUDAD_RESIDENCIA, PL.NOMBRE)
ORDER BY U.CIUDAD_RESIDENCIA NULLS LAST, PL.NOMBRE NULLS LAST;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**b) CUBE: Reporte de reproducciones por categoría y dispositivo con todas las combinaciones posibles:**
Genera un análisis multidimensional calculando los totales de reproducción cruzando cada categoría con cada dispositivo, incluyendo subtotales individuales para cada uno de los ejes.
```sql
SELECT
  CAT.NOMBRE AS CATEGORIA,
  NVL(R.ULTIMO_DISPOSITIVO, 'Sin dispositivo') AS DISPOSITIVO,
  COUNT(R.ID_REPRODUCCION) AS TOTAL_REPRODUCCIONES,
  ROUND(AVG(R.PORCENTAJE_AVANCE), 2) AS PROMEDIO_AVANCE
FROM REPRODUCCIONES R
JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
GROUP BY CUBE(
  CAT.NOMBRE,
  NVL(R.ULTIMO_DISPOSITIVO, 'Sin dispositivo')
)
ORDER BY CATEGORIA NULLS LAST, DISPOSITIVO NULLS LAST;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**c) GROUPING(): Reemplazar los NULLs generados por ROLLUP/CUBE con etiquetas legibles:**
Usa la función `GROUPING()` para identificar cuándo un registro representa un subtotal generado por `ROLLUP` (que normalmente arrojaría `NULL` en la columna agrupada) y sustituye ese valor nulo por un texto descriptivo.
```sql
SELECT
  DECODE(GROUPING(F.PERIODO_ANIO), 1, 'TOTAL GENERAL', TO_CHAR(F.PERIODO_ANIO)) AS ANIO_LABEL,
  DECODE(GROUPING(F.PERIODO_MES),  1, 'SUBTOTAL ANO',  TO_CHAR(F.PERIODO_MES))  AS MES_LABEL,
  SUM(F.MONTO_FINAL) AS INGRESOS_TOTALES
FROM FACTURACIONES F
GROUP BY ROLLUP(F.PERIODO_ANIO, F.PERIODO_MES)
ORDER BY F.PERIODO_ANIO NULLS LAST, F.PERIODO_MES NULLS LAST;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**d) GROUPING SETS: Reporte que muestre solo los totales por categoría y por ciudad, sin el detalle cruzado:**
Permite elegir subconjuntos específicos de agrupación. En este caso, suma las reproducciones totales de cada categoría y los totales de cada ciudad independientemente, evitando calcular las combinaciones entre ellas.
```sql
SELECT
  CAT.NOMBRE AS CATEGORIA,
  U.CIUDAD_RESIDENCIA AS CIUDAD,
  COUNT(R.ID_REPRODUCCION) AS TOTAL_REPRODUCCIONES
FROM REPRODUCCIONES R
JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
JOIN PERFILES P ON P.ID_PERFIL = R.ID_PERFIL
JOIN USUARIOS U ON U.ID_USUARIO = P.ID_USUARIO
GROUP BY GROUPING SETS (
  (CAT.NOMBRE),
  (U.CIUDAD_RESIDENCIA),
  ()
)
ORDER BY CATEGORIA NULLS LAST, CIUDAD NULLS LAST;
```
*Ubicación: `database/17_analitica_nt1.sql`*

#### 3.1.4 Vistas materializadas (mínimo 2)
Implementamos vistas materializadas con `BUILD IMMEDIATE REFRESH ON DEMAND` para precalcular datos y guardar físicamente el resultado en disco en lugar de procesarlo en caliente.

**a) Vista materializada que precalcule el total de reproducciones y la calificación promedio por contenido:**
Esta vista se usa como base para el reporte de "Contenido Mas Popular".
```sql
CREATE MATERIALIZED VIEW MV_CALIFICACIONES_PROMEDIO
BUILD IMMEDIATE
REFRESH ON DEMAND
AS
SELECT
  C.ID_CONTENIDO,
  C.TITULO,
  C.TIPO_CONTENIDO,
  G.NOMBRE                         AS GENERO,
  ROUND(AVG(CAL.PUNTAJE), 2)       AS PROMEDIO_PUNTAJE,
  COUNT(CAL.ID_CALIFICACION)       AS TOTAL_CALIFICACIONES,
  MIN(CAL.PUNTAJE)                 AS PUNTAJE_MINIMO,
  MAX(CAL.PUNTAJE)                 AS PUNTAJE_MAXIMO
FROM CALIFICACIONES CAL
JOIN CONTENIDOS C ON C.ID_CONTENIDO = CAL.ID_CONTENIDO
LEFT JOIN CONTENIDOS_GENEROS CG ON CG.ID_CONTENIDO = C.ID_CONTENIDO
LEFT JOIN GENEROS G ON G.ID_GENERO = CG.ID_GENERO
GROUP BY
  C.ID_CONTENIDO,
  C.TITULO,
  C.TIPO_CONTENIDO,
  G.NOMBRE;
```
*Ubicación: `database/17_analitica_nt1.sql`*

**b) Vista materializada que precalcule los ingresos mensuales por ciudad y plan de suscripción:**
Esta vista se usa como base para el reporte financiero mensual, agrupando millones de facturas en pocas filas.
```sql
CREATE MATERIALIZED VIEW MV_METRICAS_FINANCIERAS
BUILD IMMEDIATE
REFRESH ON DEMAND
AS
SELECT
  PL.NOMBRE                        AS PLAN,
  F.PERIODO_ANIO,
  F.PERIODO_MES,
  COUNT(F.ID_FACTURACION)          AS TOTAL_FACTURAS,
  SUM(F.MONTO_FINAL)               AS INGRESOS_TOTALES,
  SUM(
    CASE WHEN F.ESTADO_FACTURA = 'PAGADA'
         THEN F.MONTO_FINAL ELSE 0 END
  )                                AS INGRESOS_COBRADOS,
  SUM(
    CASE WHEN F.ESTADO_FACTURA IN ('PENDIENTE', 'VENCIDA')
         THEN F.MONTO_FINAL ELSE 0 END
  )                                AS INGRESOS_PENDIENTES,
  COUNT(DISTINCT F.ID_USUARIO)     AS USUARIOS_FACTURADOS
FROM FACTURACIONES F
JOIN USUARIOS U ON U.ID_USUARIO = F.ID_USUARIO
JOIN PLANES PL ON PL.ID_PLAN = U.ID_PLAN
GROUP BY
  PL.NOMBRE,
  F.PERIODO_ANIO,
  F.PERIODO_MES;
```
*Ubicación: `database/17_analitica_nt1.sql`*

#### 3.1.5 Fragmentación de tablas — tablespaces y datafiles (mínimo 1)
Fragmentamos la tabla `REPRODUCCIONES` por rango de fechas (por ejemplo: reproducciones de 2024, reproducciones de 2025_Q1, etc.), usando particionamiento.
**Justificación de la decisión:** Esta fragmentación evita lecturas innecesarias de bloques antiguos (Full Table Scans) en discos de alto volumen cuando el sistema consulta historiales recientes o reportes analíticos del último trimestre. Oracle redirige la consulta únicamente a la partición o tablespace que corresponde a la fecha filtrada.
```sql
CREATE TABLE REPRODUCCIONES (
  ID_REPRODUCCION         NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  ID_PERFIL               NUMBER NOT NULL,
  ID_CONTENIDO            NUMBER NOT NULL,
  PROGRESO_SEGUNDOS       NUMBER(10,0) DEFAULT 0 NOT NULL,
  DURACION_TOTAL_SEGUNDOS NUMBER(10,0) NULL,
  PORCENTAJE_AVANCE       NUMBER(5,2) DEFAULT 0 NOT NULL,
  ULTIMO_DISPOSITIVO      VARCHAR2(80) NULL,
  ESTADO_REPRODUCCION     VARCHAR2(20) DEFAULT 'EN_PROGRESO' NOT NULL,
  FECHA_INICIO            TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FECHA_ULTIMO_EVENTO     TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FECHA_FIN               TIMESTAMP NULL,
  CONSTRAINT FK_REPRO_PERFIL    FOREIGN KEY (ID_PERFIL)
    REFERENCES PERFILES(ID_PERFIL),
  CONSTRAINT FK_REPRO_CONTENIDO FOREIGN KEY (ID_CONTENIDO)
    REFERENCES CONTENIDOS(ID_CONTENIDO)
)
PARTITION BY RANGE (FECHA_INICIO) (
  PARTITION P_2024    VALUES LESS THAN (TIMESTAMP '2025-01-01 00:00:00'),
  PARTITION P_2025_Q1 VALUES LESS THAN (TIMESTAMP '2025-04-01 00:00:00'),
  PARTITION P_2025_Q2 VALUES LESS THAN (TIMESTAMP '2025-07-01 00:00:00'),
  PARTITION P_2025_Q3 VALUES LESS THAN (TIMESTAMP '2025-10-01 00:00:00'),
  PARTITION P_FUTURO  VALUES LESS THAN (MAXVALUE)
);
```
*Ubicación: `database/17_analitica_nt1.sql`*

---

### 3.2 Núcleo 2: PL/SQL — Procedimientos almacenados y disparadores
**Resultado de aprendizaje:** R.A.2 — Implementar subprogramas en PL/SQL

#### 3.2.1 Cursores (mínimo 2)
**a) Cursor que recorra todos los usuarios cuya suscripción está vencida (más de 30 días sin pago) y genere un reporte con nombre, email, plan, días de mora y monto adeudado:**
```sql
  CURSOR CUR_CARTERA_VENCIDA IS
    SELECT
      F.ID_FACTURACION,
      F.ID_USUARIO,
      U.NOMBRE    AS NOMBRE_USUARIO,
      U.EMAIL,
      F.PERIODO_ANIO,
      F.PERIODO_MES,
      F.MONTO_FINAL,
      F.FECHA_VENCIMIENTO,
      TRUNC(SYSDATE) - F.FECHA_VENCIMIENTO AS DIAS_VENCIDA
    FROM FACTURACIONES F
    JOIN USUARIOS U ON U.ID_USUARIO = F.ID_USUARIO
    WHERE F.ESTADO_FACTURA = 'PENDIENTE'
      AND F.FECHA_VENCIMIENTO < TRUNC(SYSDATE) - 30
    ORDER BY DIAS_VENCIDA DESC;
```
*Ubicación: `database/18_plsql_nt2_completo.sql`*

**b) Cursor que recorra el catálogo y para cada contenido calcule cuántas reproducciones ha tenido y actualice un campo de popularidad:**
```sql
  CURSOR CUR_POPULARIDAD_CATALOGO IS
    SELECT
      C.ID_CONTENIDO,
      C.TITULO,
      COUNT(R.ID_REPRODUCCION) AS TOTAL_REPRODUCCIONES,
      ROUND(AVG(R.PORCENTAJE_AVANCE), 2) AS PROMEDIO_AVANCE,
      COUNT(CAL.ID_CALIFICACION) AS TOTAL_CALIFICACIONES,
      ROUND(AVG(CAL.PUNTAJE), 2) AS PROMEDIO_PUNTAJE
    FROM CONTENIDOS C
    LEFT JOIN REPRODUCCIONES R
      ON R.ID_CONTENIDO = C.ID_CONTENIDO
    LEFT JOIN CALIFICACIONES CAL
      ON CAL.ID_CONTENIDO = C.ID_CONTENIDO
    GROUP BY C.ID_CONTENIDO, C.TITULO
    HAVING COUNT(R.ID_REPRODUCCION) > 0
    ORDER BY COUNT(R.ID_REPRODUCCION) DESC;
```
*Ubicación: `database/18_plsql_nt2_completo.sql`*

#### 3.2.2 Procedimientos almacenados (mínimo 3)
**a) SP_REGISTRAR_USUARIO:** Recibe los datos del usuario y el plan elegido, valida que el email no exista, crea la cuenta, crea un perfil predeterminado y registra el primer pago.
```sql
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_USUARIO (
  P_NOMBRE           IN  VARCHAR2,
  P_EMAIL            IN  VARCHAR2,
  P_TELEFONO         IN  VARCHAR2,
  P_FECHA_NACIMIENTO IN  DATE,
  P_CIUDAD_RESIDENCIA IN VARCHAR2,
  P_PASSWORD_HASH    IN  VARCHAR2,
  P_PLAN_NOMBRE      IN  VARCHAR2,
  P_NOMBRE_PERFIL    IN  VARCHAR2,
  P_TIPO_PERFIL      IN  VARCHAR2 DEFAULT 'adulto',
  P_ID_USUARIO       OUT NUMBER
) IS
  V_ID_PLAN    PLANES.ID_PLAN%TYPE;
  V_PERFIL_ID  PERFILES.ID_PERFIL%TYPE;
BEGIN
  SELECT ID_PLAN INTO V_ID_PLAN FROM PLANES WHERE UPPER(NOMBRE) = UPPER(P_PLAN_NOMBRE);

  INSERT INTO USUARIOS (NOMBRE, EMAIL, TELEFONO, FECHA_NACIMIENTO, CIUDAD_RESIDENCIA, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN)
  VALUES (P_NOMBRE, LOWER(TRIM(P_EMAIL)), P_TELEFONO, P_FECHA_NACIMIENTO, P_CIUDAD_RESIDENCIA, P_PASSWORD_HASH, 'usuario', 'ACTIVO', V_ID_PLAN)
  RETURNING ID_USUARIO INTO P_ID_USUARIO;

  INSERT INTO PERFILES (ID_USUARIO, NOMBRE, TIPO_PERFIL)
  VALUES (P_ID_USUARIO, P_NOMBRE_PERFIL, LOWER(TRIM(P_TIPO_PERFIL)))
  RETURNING ID_PERFIL INTO V_PERFIL_ID;

  INSERT INTO FACTURACIONES (ID_USUARIO, PERIODO_ANIO, PERIODO_MES, FECHA_CORTE, FECHA_VENCIMIENTO, MONTO_BASE, DESCUENTO_REFERIDOS_PCT, DESCUENTO_FIDELIDAD_PCT, MONTO_FINAL, ESTADO_FACTURA)
  VALUES (P_ID_USUARIO, EXTRACT(YEAR FROM SYSDATE), EXTRACT(MONTH FROM SYSDATE), TRUNC(SYSDATE), TRUNC(ADD_MONTHS(SYSDATE, 1)), (SELECT PRECIO_MENSUAL FROM PLANES WHERE ID_PLAN = V_ID_PLAN), 0, 0, 0, 'PENDIENTE');
  COMMIT;
EXCEPTION
  WHEN NO_DATA_FOUND THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20101, 'El plan especificado no existe');
  WHEN DUP_VAL_ON_INDEX THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20102, 'El correo electronico ya esta registrado');
  WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20103, 'Error en registro: ' || SQLERRM);
END;
/
```
*Ubicación: `database/18_plsql_nt2_completo.sql`*

**b) SP_CAMBIAR_PLAN:** Recibe el id del usuario y el nuevo plan, valida que sea un cambio válido (no puede bajar de plan si tiene más perfiles de los permitidos), actualiza el plan y registra el cambio.
```sql
CREATE OR REPLACE PROCEDURE SP_CAMBIAR_PLAN (
  P_ID_USUARIO       IN NUMBER,
  P_NUEVO_PLAN_NOMBRE IN VARCHAR2
) IS
  V_ID_NUEVO_PLAN    PLANES.ID_PLAN%TYPE;
  V_LIMITE_NUEVO     PLANES.LIMITE_PERFILES%TYPE;
  V_PERFILES_ACTUALES NUMBER;
BEGIN
  SELECT ID_PLAN, LIMITE_PERFILES INTO V_ID_NUEVO_PLAN, V_LIMITE_NUEVO FROM PLANES WHERE UPPER(NOMBRE) = UPPER(P_NUEVO_PLAN_NOMBRE);
  SELECT COUNT(*) INTO V_PERFILES_ACTUALES FROM PERFILES WHERE ID_USUARIO = P_ID_USUARIO;

  IF V_PERFILES_ACTUALES > V_LIMITE_NUEVO THEN
    RAISE_APPLICATION_ERROR(-20111, 'El usuario tiene más perfiles de los permitidos en el nuevo plan');
  END IF;

  UPDATE USUARIOS SET ID_PLAN = V_ID_NUEVO_PLAN, FECHA_ACTUALIZACION = CURRENT_TIMESTAMP WHERE ID_USUARIO = P_ID_USUARIO;
  IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20112, 'Usuario no existe'); END IF;
  COMMIT;
EXCEPTION
  WHEN NO_DATA_FOUND THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20113, 'El plan especificado no existe');
  WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20114, 'Error al cambiar plan: ' || SQLERRM);
END;
/
```
*Ubicación: `database/18_plsql_nt2_completo.sql`*

**c) SP_APLICAR_MORA_CUENTAS:** Este procedimiento marca facturas vencidas y desactiva cuentas con mora mayor a 30 días, pensado para ejecución nocturna automatizada.
```sql
CREATE OR REPLACE PROCEDURE SP_APLICAR_MORA_CUENTAS
IS
BEGIN
  UPDATE FACTURACIONES F
     SET F.ESTADO_FACTURA = 'VENCIDA'
   WHERE F.ESTADO_FACTURA = 'PENDIENTE'
     AND F.FECHA_VENCIMIENTO < TRUNC(SYSDATE);

  UPDATE USUARIOS U
     SET U.ESTADO_CUENTA = 'INACTIVO'
   WHERE EXISTS (
     SELECT 1
       FROM FACTURACIONES F
      WHERE F.ID_USUARIO = U.ID_USUARIO
        AND F.ESTADO_FACTURA IN ('PENDIENTE', 'VENCIDA')
        AND F.FECHA_VENCIMIENTO <= TRUNC(SYSDATE) - 30
   );
END;
/
```
*Ubicación: `database/09_finanzas_referidos_iteracion5.sql`*

#### 3.2.3 Funciones (mínimo 2)
**a) FN_CALCULAR_MONTO:** Recibe un id de usuario y retorna el monto a cobrar en el próximo mes, considerando el plan actual y posibles descuentos por referidos y antigüedad (>12 meses: 10%, >24 meses: 15%).
```sql
CREATE OR REPLACE FUNCTION FN_CALCULAR_MONTO (
  P_ID_USUARIO    IN NUMBER,
  P_PERIODO_ANIO  IN NUMBER,
  P_PERIODO_MES   IN NUMBER
) RETURN NUMBER
IS
  V_MONTO_BASE          PLANES.PRECIO_MENSUAL%TYPE;
  V_DESC_REF_PCT        NUMBER(5,2) := 0;
  V_DESC_FID_PCT        NUMBER(5,2) := 0;
  V_MESES_ANTIGUEDAD    NUMBER;
  V_MONTO_FINAL         NUMBER(10,2);
BEGIN
  SELECT P.PRECIO_MENSUAL INTO V_MONTO_BASE FROM USUARIOS U JOIN PLANES P ON P.ID_PLAN = U.ID_PLAN WHERE U.ID_USUARIO = P_ID_USUARIO;
  SELECT COALESCE(SUM(R.DESCUENTO_PCT), 0) INTO V_DESC_REF_PCT FROM REFERIDOS R WHERE R.ID_USUARIO_REFERENTE = P_ID_USUARIO AND R.ESTADO_REFERIDO = 'VALIDADO';
  V_DESC_REF_PCT := LEAST(V_DESC_REF_PCT, 30);
  SELECT MONTHS_BETWEEN(SYSDATE, MIN(FECHA_CREACION)) INTO V_MESES_ANTIGUEDAD FROM USUARIOS WHERE ID_USUARIO = P_ID_USUARIO;

  IF V_MESES_ANTIGUEDAD >= 24 THEN V_DESC_FID_PCT := 15;
  ELSIF V_MESES_ANTIGUEDAD >= 12 THEN V_DESC_FID_PCT := 10; END IF;

  V_MONTO_FINAL := ROUND(V_MONTO_BASE * (1 - LEAST(V_DESC_REF_PCT + V_DESC_FID_PCT, 100) / 100), 2);
  RETURN V_MONTO_FINAL;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RETURN 0;
  WHEN OTHERS THEN RETURN -1;
END;
/
```
*Ubicación: `database/18_plsql_nt2_completo.sql`*

**b) FN_CONTENIDO_RECOMENDADO:** Recibe un id de perfil y retorna el título del contenido más afín al perfil basándose en los géneros que más ha reproducido.
```sql
CREATE OR REPLACE FUNCTION FN_CONTENIDO_RECOMENDADO (
  P_ID_PERFIL IN NUMBER
) RETURN NUMBER
IS
  V_ID_RECOMENDADO CONTENIDOS.ID_CONTENIDO%TYPE;
BEGIN
  SELECT ID_CONTENIDO INTO V_ID_RECOMENDADO FROM (
      SELECT C.ID_CONTENIDO, COUNT(R.ID_REPRODUCCION) AS POPULARIDAD
      FROM CONTENIDOS C
      JOIN CONTENIDOS_GENEROS CG ON CG.ID_CONTENIDO = C.ID_CONTENIDO
      LEFT JOIN REPRODUCCIONES R ON R.ID_CONTENIDO = C.ID_CONTENIDO
      WHERE CG.ID_GENERO IN (
        SELECT CG2.ID_GENERO FROM FAVORITOS F JOIN CONTENIDOS_GENEROS CG2 ON CG2.ID_CONTENIDO = F.ID_CONTENIDO WHERE F.ID_PERFIL = P_ID_PERFIL
      )
      AND C.ID_CONTENIDO NOT IN (SELECT R.ID_CONTENIDO FROM REPRODUCCIONES R WHERE R.ID_PERFIL = P_ID_PERFIL)
      GROUP BY C.ID_CONTENIDO
      ORDER BY COUNT(R.ID_REPRODUCCION) DESC
    ) WHERE ROWNUM = 1;
  RETURN V_ID_RECOMENDADO;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RETURN NULL;
  WHEN OTHERS THEN RETURN NULL;
END;
/
```
*Ubicación: `database/18_plsql_nt2_completo.sql`*

#### 3.2.4 Excepciones (mínimo 2)
* **a) En SP_REGISTRAR_USUARIO:** Manejamos `DUP_VAL_ON_INDEX` de manera explícita (para correos duplicados) y `NO_DATA_FOUND` si no se encuentra el plan de suscripción seleccionado, generando un error `-20102` y `-20101` correspondientemente.
* **b) En SP_CAMBIAR_PLAN:** Creamos un lanzamiento de error nativo `-20111` si el usuario supera el límite de perfiles del plan destino, interrumpiendo el flujo de transacción con `RAISE_APPLICATION_ERROR`.

#### 3.2.5 Disparadores (mínimo 4)
**a) Trigger a nivel de fila en REPRODUCCIONES:** Cada vez que se inserta una reproducción, verificar que el usuario tenga una cuenta activa (estado_cuenta = 'ACTIVO') y rechaza de lo contrario.
```sql
CREATE OR REPLACE TRIGGER TRG_REPRODUCCIONES_REGLAS_BIU
BEFORE INSERT OR UPDATE ON REPRODUCCIONES
FOR EACH ROW
DECLARE
  V_ESTADO_CUENTA USUARIOS.ESTADO_CUENTA%TYPE;
  V_TIPO_PERFIL PERFILES.TIPO_PERFIL%TYPE;
  V_CLASIFICACION CONTENIDOS.CLASIFICACION_EDAD%TYPE;
BEGIN
  SELECT U.ESTADO_CUENTA, P.TIPO_PERFIL, C.CLASIFICACION_EDAD INTO V_ESTADO_CUENTA, V_TIPO_PERFIL, V_CLASIFICACION FROM PERFILES P INNER JOIN USUARIOS U ON U.ID_USUARIO = P.ID_USUARIO INNER JOIN CONTENIDOS C ON C.ID_CONTENIDO = :NEW.ID_CONTENIDO WHERE P.ID_PERFIL = :NEW.ID_PERFIL;
  IF V_ESTADO_CUENTA <> 'ACTIVO' THEN RAISE_APPLICATION_ERROR(-20021, 'La cuenta debe estar activa para registrar reproducciones'); END IF;
  IF FN_CLASIFICACION_PERMITIDA_PARA_PERFIL(V_TIPO_PERFIL, V_CLASIFICACION) = 0 THEN RAISE_APPLICATION_ERROR(-20022, 'El perfil seleccionado no puede reproducir este contenido'); END IF;
  IF :NEW.DURACION_TOTAL_SEGUNDOS IS NOT NULL AND :NEW.PROGRESO_SEGUNDOS > :NEW.DURACION_TOTAL_SEGUNDOS THEN RAISE_APPLICATION_ERROR(-20023, 'El progreso no puede superar la duracion total'); END IF;
  
  IF :NEW.DURACION_TOTAL_SEGUNDOS IS NOT NULL AND :NEW.DURACION_TOTAL_SEGUNDOS > 0 THEN
    :NEW.PORCENTAJE_AVANCE := ROUND(LEAST(100, (:NEW.PROGRESO_SEGUNDOS / :NEW.DURACION_TOTAL_SEGUNDOS) * 100), 2);
  ELSE :NEW.PORCENTAJE_AVANCE := 0; END IF;

  :NEW.FECHA_ULTIMO_EVENTO := CURRENT_TIMESTAMP;
  IF :NEW.ESTADO_REPRODUCCION = 'FINALIZADO' AND :NEW.FECHA_FIN IS NULL THEN :NEW.FECHA_FIN := CURRENT_TIMESTAMP; END IF;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RAISE_APPLICATION_ERROR(-20024, 'No existe perfil o contenido');
END;
/
```
*Ubicación: `database/04_reproducciones_iteracion2.sql`*

**b) Trigger a nivel de fila en PERFILES:** Al insertar un nuevo perfil, verificar que el usuario no exceda el número máximo de perfiles según su plan. Si lo excede, rechazar.
```sql
CREATE OR REPLACE TRIGGER TRG_PERFILES_LIMITE_PLAN_BI
BEFORE INSERT ON PERFILES
FOR EACH ROW
DECLARE
  V_LIMITE PLANES.LIMITE_PERFILES%TYPE;
  V_ACTUALES NUMBER;
BEGIN
  SELECT NVL(P.LIMITE_PERFILES, 1) INTO V_LIMITE FROM USUARIOS U LEFT JOIN PLANES P ON P.ID_PLAN = U.ID_PLAN WHERE U.ID_USUARIO = :NEW.ID_USUARIO;
  SELECT COUNT(*) INTO V_ACTUALES FROM PERFILES PR WHERE PR.ID_USUARIO = :NEW.ID_USUARIO;

  IF V_ACTUALES >= V_LIMITE THEN
    RAISE_APPLICATION_ERROR(-20011, 'La cuenta supera el limite de perfiles permitido por su plan');
  END IF;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20012, 'No existe la cuenta asociada');
END;
/
```
*Ubicación: `database/03_reglas_perfiles_iteracion1.sql`*

**c) Trigger a nivel de fila en CALIFICACIONES:** Verificar que el perfil haya reproducido al menos el 50% del contenido antes de permitir una calificación. Si no, rechazar.
```sql
CREATE OR REPLACE TRIGGER TRG_CALIFICACIONES_REGLAS_BIU
BEFORE INSERT OR UPDATE ON CALIFICACIONES
FOR EACH ROW
DECLARE
  V_PERFIL_EXISTE NUMBER;
  V_CONTENIDO_EXISTE NUMBER;
  V_MAX_AVANCE NUMBER(5,2);
BEGIN
  SELECT COUNT(*) INTO V_PERFIL_EXISTE FROM PERFILES WHERE ID_PERFIL = :NEW.ID_PERFIL;
  SELECT COUNT(*) INTO V_CONTENIDO_EXISTE FROM CONTENIDOS WHERE ID_CONTENIDO = :NEW.ID_CONTENIDO;
  IF V_PERFIL_EXISTE = 0 OR V_CONTENIDO_EXISTE = 0 THEN RAISE_APPLICATION_ERROR(-20042, 'No existe perfil o contenido asociado'); END IF;

  SELECT NVL(MAX(R.PORCENTAJE_AVANCE), 0) INTO V_MAX_AVANCE FROM REPRODUCCIONES R WHERE R.ID_PERFIL = :NEW.ID_PERFIL AND R.ID_CONTENIDO = :NEW.ID_CONTENIDO;
  IF V_MAX_AVANCE < 50 THEN
    RAISE_APPLICATION_ERROR(-20041, 'Debes superar el 50% de reproduccion para calificar este contenido');
  END IF;
  :NEW.FECHA_CALIFICACION := CURRENT_TIMESTAMP;
END;
/
```
*Ubicación: `database/06_comunidad_calificaciones_iteracion3.sql`*

**d) Trigger a nivel de fila en PAGOS:** Después de insertar un pago exitoso, actualizar el estado de la factura a 'PAGADA' y reactivar la cuenta.
```sql
CREATE OR REPLACE TRIGGER TRG_PAGOS_ACTUALIZA_FACTURA_AI
AFTER INSERT ON PAGOS
FOR EACH ROW
BEGIN
  IF :NEW.ESTADO_TRANSACCION = 'EXITOSO' THEN
    UPDATE FACTURACIONES
       SET ESTADO_FACTURA = 'PAGADA',
           FECHA_PAGO = NVL(FECHA_PAGO, :NEW.FECHA_PAGO)
     WHERE ID_FACTURACION = :NEW.ID_FACTURACION;

    UPDATE USUARIOS
       SET ESTADO_CUENTA = 'ACTIVO'
     WHERE ID_USUARIO = :NEW.ID_USUARIO;
  END IF;
END;
/
```
*Ubicación: `database/09_finanzas_referidos_iteracion5.sql`*

---

### 3.3 Núcleo 3: Transacciones y Concurrencia
**Resultado de aprendizaje:** R.A.1 — Administrar componentes fundamentales

#### 3.3.1 Especificación de transacciones (mínimo 3)
**a) Transacción de registro completo:** Crear usuario + perfil + factura inicial. Si falla cualquier paso, deshacer todo.
```sql
DECLARE
  -- Variables de usuario simuladas en el procedimiento (V_NOMBRE_PERFIL, V_EMAIL, etc.)
BEGIN
  SELECT ID_PLAN, PRECIO_MENSUAL INTO V_ID_PLAN, V_PRECIO FROM PLANES WHERE UPPER(NOMBRE) = UPPER(V_PLAN_NOMBRE);

  INSERT INTO USUARIOS (NOMBRE, EMAIL, TELEFONO, FECHA_NACIMIENTO, CIUDAD_RESIDENCIA, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN)
  VALUES (V_NOMBRE_PERFIL, LOWER(TRIM(V_EMAIL)), V_TELEFONO, V_FECHA_NAC, V_CIUDAD, V_PASSWORD_HASH, 'usuario', 'ACTIVO', V_ID_PLAN)
  RETURNING ID_USUARIO INTO V_ID_USUARIO;

  INSERT INTO PERFILES (ID_USUARIO, NOMBRE, TIPO_PERFIL) VALUES (V_ID_USUARIO, V_NOMBRE_PERFIL_INI, 'adulto')
  RETURNING ID_PERFIL INTO V_PERFIL_ID;

  INSERT INTO FACTURACIONES (ID_USUARIO, PERIODO_ANIO, PERIODO_MES, FECHA_CORTE, FECHA_VENCIMIENTO, MONTO_BASE, DESCUENTO_REFERIDOS_PCT, DESCUENTO_FIDELIDAD_PCT, ESTADO_FACTURA)
  VALUES (V_ID_USUARIO, EXTRACT(YEAR FROM SYSDATE), EXTRACT(MONTH FROM SYSDATE), TRUNC(SYSDATE), TRUNC(ADD_MONTHS(SYSDATE, 1)), V_PRECIO, 0, 0, 'PENDIENTE');

  COMMIT;
EXCEPTION
  WHEN DUP_VAL_ON_INDEX THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20301, 'Transaccion 1 fallida: correo existe. ROLLBACK aplicado.');
  WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20302, 'Transaccion 1 fallida: ' || SQLERRM || '. ROLLBACK aplicado.');
END;
/
```
*Ubicación: `database/19_transacciones_nt3.sql`*

**b) Transacción de renovación mensual:** Para cada usuario activo, verificar plan, calcular monto y registrar factura. Usar SAVEPOINT para que si falla un usuario, no se pierdan los anteriores.
```sql
DECLARE
  CURSOR CUR_USUARIOS_ACTIVOS IS SELECT ID_USUARIO, ID_PLAN FROM USUARIOS WHERE ESTADO_CUENTA = 'ACTIVO' AND ID_PLAN IS NOT NULL;
BEGIN
  FOR R_USUARIO IN CUR_USUARIOS_ACTIVOS LOOP
    BEGIN
      SAVEPOINT SP_USUARIO;
      SELECT PRECIO_MENSUAL INTO V_PRECIO FROM PLANES WHERE ID_PLAN = R_USUARIO.ID_PLAN;
      INSERT INTO FACTURACIONES (ID_USUARIO, PERIODO_ANIO, PERIODO_MES, FECHA_CORTE, FECHA_VENCIMIENTO, MONTO_BASE, ESTADO_FACTURA)
      VALUES (R_USUARIO.ID_USUARIO, V_ANIO, V_MES, TRUNC(SYSDATE), TRUNC(ADD_MONTHS(SYSDATE, 1)), V_PRECIO, 'PENDIENTE');
      V_CONTADOR_OK := V_CONTADOR_OK + 1;
    EXCEPTION
      WHEN DUP_VAL_ON_INDEX THEN ROLLBACK TO SAVEPOINT SP_USUARIO; V_CONTADOR_ERR := V_CONTADOR_ERR + 1;
      WHEN OTHERS THEN ROLLBACK TO SAVEPOINT SP_USUARIO; V_CONTADOR_ERR := V_CONTADOR_ERR + 1;
    END;
  END LOOP;
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20311, 'Transaccion 2 fallida completamente: ' || SQLERRM);
END;
/
```
*Ubicación: `database/19_transacciones_nt3.sql`*

**c) Transacción de eliminación de cuenta:** Eliminar reproducciones, favoritos, calificaciones, perfiles, pagos, facturaciones y finalmente el usuario. Debe ser todo o nada respetando constraints (hard delete).
```sql
DECLARE
  V_ID_USUARIO NUMBER := -1;
BEGIN
  SELECT ID_USUARIO INTO V_ID_USUARIO FROM USUARIOS WHERE EMAIL = 'transaccion.test@minflix.local';

  DELETE FROM REPRODUCCIONES WHERE ID_PERFIL IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO);
  DELETE FROM FAVORITOS WHERE ID_PERFIL IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO);
  DELETE FROM CALIFICACIONES WHERE ID_PERFIL IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO);
  DELETE FROM REPORTES WHERE ID_PERFIL_REPORTADOR IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO);
  UPDATE REPORTES SET ID_USUARIO_MODERADOR = NULL WHERE ID_USUARIO_MODERADOR = V_ID_USUARIO;
  DELETE FROM PAGOS WHERE ID_USUARIO = V_ID_USUARIO;
  DELETE FROM PERFILES WHERE ID_USUARIO = V_ID_USUARIO;
  DELETE FROM FACTURACIONES WHERE ID_USUARIO = V_ID_USUARIO;
  DELETE FROM REFERIDOS WHERE ID_USUARIO_REFERENTE = V_ID_USUARIO OR ID_USUARIO_REFERIDO = V_ID_USUARIO;
  DELETE FROM EMPLEADOS WHERE ID_USUARIO = V_ID_USUARIO;
  DELETE FROM USUARIOS WHERE ID_USUARIO = V_ID_USUARIO;
  
  COMMIT;
EXCEPTION
  WHEN NO_DATA_FOUND THEN ROLLBACK;
  WHEN OTHERS THEN ROLLBACK; RAISE_APPLICATION_ERROR(-20321, 'Transaccion 3 fallida: ' || SQLERRM || '. ROLLBACK aplicado.');
END;
/
```
*Ubicación: `database/19_transacciones_nt3.sql`*

#### 3.3.2 Concurrencia de datos (mínimo 1 escenario documentado)
**Escenario de concurrencia:** Dos sesiones intentan cambiar el plan del mismo usuario simultáneamente. Demostrar como Oracle maneja el bloqueo y como se resuelve con `SELECT FOR UPDATE`.
```sql
DECLARE
  V_ID_USUARIO     NUMBER := -1;
  V_ID_PLAN_ACTUAL NUMBER;
  V_NUEVO_PLAN     VARCHAR2(40) := 'PREMIUM';
  V_ID_NUEVO_PLAN  NUMBER;
BEGIN
  -- Sesion A identifica al usuario y lo bloquea explícitamente para modificarlo
  SELECT ID_USUARIO INTO V_ID_USUARIO
  FROM USUARIOS
  WHERE EMAIL = 'usuario.seed@minflix.local'
  FOR UPDATE WAIT 10;
  
  -- Aquí la fila queda bloqueada y cualquier otra sesión que intente modificar
  -- este usuario (o haga FOR UPDATE) tendrá que esperar el COMMIT o ROLLBACK

  SELECT ID_PLAN INTO V_ID_NUEVO_PLAN FROM PLANES WHERE UPPER(NOMBRE) = UPPER(V_NUEVO_PLAN);

  -- Simulamos procesamiento largo...
  DBMS_LOCK.SLEEP(3);

  UPDATE USUARIOS
     SET ID_PLAN = V_ID_NUEVO_PLAN,
         FECHA_ACTUALIZACION = CURRENT_TIMESTAMP
   WHERE ID_USUARIO = V_ID_USUARIO;

  -- Se liberan los bloqueos
  COMMIT;
EXCEPTION
  WHEN NO_DATA_FOUND THEN NULL;
  WHEN OTHERS THEN ROLLBACK;
END;
/
```
*Ubicación: `database/19_transacciones_nt3.sql`*

---

### 3.4 Núcleo 4: Índices

#### 3.4.1 Creación y administración de índices (mínimo 4)
**a) Índice en REPRODUCCIONES (id_perfil, fecha_hora_inicio):** Útil para consultas del historial de un perfil ya que comúnmente filtra por el ID del perfil y ordena las reproducciones descendentemente por su fecha de inicio, cubriendo ambas cláusulas en la consulta y reduciendo acceso a la tabla.
```sql
CREATE INDEX IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO
ON REPRODUCCIONES (ID_PERFIL, FECHA_INICIO DESC);
```
*Ubicación: `database/20_indices_nt4.sql`*

**b) Índice en USUARIOS (email):** Implementado como un UNIQUE CONSTRAINT implícito. Es necesario para evitar la inserción de cuentas con el mismo correo y porque la mayor parte del sistema se autentica filtrando directamente el campo email.
```sql
-- La creación del índice unique se realiza al definir la tabla USUARIOS:
CONSTRAINT UK_USUARIOS_EMAIL UNIQUE (EMAIL)
```
*Ubicación: `database/01_bootstrap_oracle_iteracion1.sql`*

**c) Índice en CONTENIDOS (id_categoria, anio_lanzamiento):** Acelera el proceso de descubrimiento en el catálogo cuando el usuario selecciona una categoría y pide ver el contenido ordenado por los más recientes.
```sql
CREATE INDEX IDX_CONTENIDOS_CATEGORIA_ANIO
ON CONTENIDOS (ID_CATEGORIA, ANIO_LANZAMIENTO DESC);
```
*Ubicación: `database/20_indices_nt4.sql`*

**d) Índice adicional a elección (USUARIOS - ciudad y estado_cuenta):** Acelera las vistas analíticas de consumo y finanzas que agrupan frecuentemente por ciudad de residencia y estado de cuenta, ignorando la sensibilidad a mayúsculas utilizando la función `UPPER`.
```sql
CREATE INDEX IDX_USUARIOS_CIUDAD_ESTADO
ON USUARIOS (UPPER(CIUDAD_RESIDENCIA), ESTADO_CUENTA);
```
*Ubicación: `database/20_indices_nt4.sql`*

##### Análisis de Rendimiento (EXPLAIN PLAN)
Se evaluó una consulta pesada para extraer las últimas reproducciones de un perfil, juntando múltiples tablas de contenidos y categorías.

**Consulta Evaluada:**
```sql
SELECT
  R.ID_REPRODUCCION, C.TITULO, CAT.NOMBRE AS CATEGORIA, R.FECHA_INICIO
FROM REPRODUCCIONES R
JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
WHERE R.ID_PERFIL = 1
ORDER BY R.FECHA_INICIO DESC
FETCH FIRST 50 ROWS ONLY;
```

* **Antes del Índice (`IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO`):**
Oracle escanea la tabla y ordena los resultados en memoria (`SORT ORDER BY`). Para perfiles con alto consumo, el costo sube linealmente con el tiempo ya que tiene que leer muchos bloques de historial antes de ordenar.
* **Después del Índice:**
El motor utiliza un `INDEX RANGE SCAN` aprovechando que los datos en el índice ya están pre-ordenados por fecha descendente. El paso costoso de `SORT` se elimina y el tiempo de CPU y costo disminuyen significativamente.

*Ubicación: `database/20_indices_nt4.sql`*

---

### 3.5 Núcleo 5: Administración de acceso a BD
**Resultado de aprendizaje:** R.A.1 — Administrar componentes fundamentales

#### 3.5.1 Esquema de usuarios y roles (mínimo 3 roles)
Se crearon los siguientes roles con privilegios diferenciados (implementados en `database/11_seguridad_roles_nt5.sql`):

| Rol | Descripción | Privilegios |
| :--- | :--- | :--- |
| **ROL_ADMIN** | Administrador de la plataforma | CRUD en todas las tablas, crear/eliminar usuarios, ejecutar todos los procedimientos |
| **ROL_ANALISTA** | Analista de datos / gerencia | SELECT en todas las tablas, ejecutar procedimientos de reportes, acceso a vistas materializadas |
| **ROL_SOPORTE** | Soporte al cliente | SELECT en USUARIOS, PERFILES, REPORTES, PAGOS. INSERT/UPDATE en REPORTES. |
| **ROL_CONTENIDO** | Gestor de catálogo | CRUD en CONTENIDOS, TEMPORADAS, EPISODIOS, GENEROS. SELECT en REPRODUCCIONES y CALIFICACIONES |

#### 3.5.2 Implementación (mínimo 1 usuario por rol)

**d) Crear al menos un perfil (PROFILE) que limite los recursos:**
Se creó un perfil que limita a 3 sesiones concurrentes, inactividad de 30 minutos y bloqueo tras 5 intentos fallidos.
```sql
CREATE PROFILE PRF_MINFLIX_OPERACION LIMIT
  SESSIONS_PER_USER 3
  IDLE_TIME 30
  FAILED_LOGIN_ATTEMPTS 5
  PASSWORD_LIFE_TIME 180;
```
*Ubicación: `database/11_seguridad_roles_nt5.sql`*

**a) Crear al menos un usuario Oracle por cada rol definido:**
```sql
CREATE USER MINFLIX_ADMIN IDENTIFIED BY "Admin123*";
CREATE USER MINFLIX_ANALISTA IDENTIFIED BY "Analista123*";
CREATE USER MINFLIX_SOPORTE IDENTIFIED BY "Soporte123*";
CREATE USER MINFLIX_CONTENIDO IDENTIFIED BY "Contenido123*";

ALTER USER MINFLIX_ADMIN PROFILE PRF_MINFLIX_OPERACION;
ALTER USER MINFLIX_ANALISTA PROFILE PRF_MINFLIX_OPERACION;
ALTER USER MINFLIX_SOPORTE PROFILE PRF_MINFLIX_OPERACION;
ALTER USER MINFLIX_CONTENIDO PROFILE PRF_MINFLIX_OPERACION;
```

**b) Asignar los privilegios correspondientes mediante GRANT:**
```sql
-- Permiso de sesion
GRANT CREATE SESSION TO MINFLIX_ADMIN, MINFLIX_ANALISTA, MINFLIX_SOPORTE, MINFLIX_CONTENIDO;

-- Asignacion de roles
GRANT ROL_ADMIN TO MINFLIX_ADMIN;
GRANT ROL_ANALISTA TO MINFLIX_ANALISTA;
GRANT ROL_SOPORTE TO MINFLIX_SOPORTE;
GRANT ROL_CONTENIDO TO MINFLIX_CONTENIDO;

-- Ejemplo de GRANTs al ROL_ANALISTA: lectura sin acceso a eliminación
GRANT SELECT ON PLANES TO ROL_ANALISTA;
GRANT SELECT ON USUARIOS TO ROL_ANALISTA;
GRANT SELECT ON FACTURACIONES TO ROL_ANALISTA;

-- Ejemplo de GRANTs al ROL_SOPORTE: actualizar estados de reportes sin acceso financiero
GRANT SELECT ON USUARIOS TO ROL_SOPORTE;
GRANT UPDATE ON REPORTES TO ROL_SOPORTE;
```
*Ubicación: `database/11_seguridad_roles_nt5.sql`*

**c) Demostrar que cada usuario solo puede hacer lo que su rol permite:**
1. Nos conectamos como `MINFLIX_ANALISTA`.
2. Intentamos realizar un `INSERT` sobre la tabla `CONTENIDOS` (operación exclusiva para ROL_ADMIN o ROL_CONTENIDO).
3. **Resultado / Error:** Oracle rechaza inmediatamente la transacción devolviendo el error de seguridad `ORA-01031: insufficient privileges`.

*(Captura de pantalla de la consola evidenciando el error ORA-01031)*

---

## 4. Datos de prueba
El sistema cuenta con datos suficientes para que los reportes sean significativos. Los datos son **ASIMÉTRICOS** para que los reportes con ROLLUP, CUBE y PIVOT muestren diferencias reales (no todos los usuarios están en la misma ciudad ni tienen el mismo plan).

### Mínimos requeridos y generados:
| Tabla | Mínimo de registros | Notas |
| :--- | :--- | :--- |
| **PLANES** | 3 | Básico, Estándar, Premium |
| **USUARIOS** | 30 | Distribuidos en las 3 ciudades principales y los 3 planes |
| **PERFILES** | 50 | Algunos usuarios con múltiples perfiles |
| **CATEGORIAS** | 5 | Películas, Series, Documentales, Música, Podcasts |
| **GENEROS** | 8 | Acción, Comedia, Drama, Suspenso, Romance, Ciencia Ficción, Terror, Infantil |
| **CONTENIDO** | 40 | Distribuido en categorías y géneros variados |
| **TEMPORADAS** | 15 | Para series y podcasts |
| **EPISODIOS** | 50 | Para las temporadas |
| **REPRODUCCIONES** | 200 | Variadas por perfil, contenido, dispositivo y fecha |
| **CALIFICACIONES** | 60 | Variadas en estrellas (1-5) |
| **PAGOS** | 80 | Historial de varios meses, algunos fallidos |
| **FAVORITOS** | 40 | Listas de favoritos variadas |

*Todos estos datos son generados de forma consistente en el script de Bootstrap de Iteraciones (`database/01` al `database/10`).*

---

## 5. Entregables
El proyecto se entrega como un único paquete con los siguientes componentes:
1. **Documento de modelo de negocio:** actores, procesos, reglas de negocio (mínimo 10), restricciones del dominio. *(Formato: Word o PDF)*
2. **Modelo Entidad-Relación (MER):** completo y profesional. *(Formato: Imagen PNG o PDF)*
3. **Script de creación de tablas:** con restricciones y comentarios. *(Formato: .sql)*
4. **Script de inserción de datos de prueba:** *(Formato: .sql)*
5. **Script de consultas avanzadas (Núcleo 1):** parametrizadas, PIVOT, UNPIVOT, ROLLUP, CUBE, GROUPING SETS, vistas materializadas, fragmentación. *(Formato: .sql)*
6. **Script de PL/SQL (Núcleo 2):** cursores, procedimientos, funciones, excepciones, disparadores. *(Formato: .sql)*
7. **Script de transacciones (Núcleo 3):** especificación y demostración de las 3 transacciones + escenario de concurrencia. *(Formato: .sql)*
8. **Script de índices (Núcleo 4):** creación + análisis EXPLAIN PLAN con capturas. *(Formato: .sql + capturas)*
9. **Script de usuarios y roles (Núcleo 5):** creación de roles, usuarios, GRANT, demostración. *(Formato: .sql)*
10. **Documento de sustentación:** justificación de decisiones de diseño, análisis de índices, escenario de concurrencia. *(Formato: Word o PDF, máx 10 páginas)*

---

## 6. Criterios de evaluación y Reglas
* **NT1: Consultas avanzadas (25%):** Funcionamiento correcto de los reportes y agregaciones.
* **NT2: PL/SQL (30%):** Los subprogramas y triggers deben cumplir correctamente y validar las reglas de negocio.
* **NT3: Transacciones (15%):** Correcto uso de COMMIT/ROLLBACK/SAVEPOINT y documentación de concurrencia.
* **NT4: Índices (10%):** Creación e impacto visible mediante EXPLAIN PLAN.
* **NT5: Usuarios y roles (10%):** Restricciones de seguridad y perfiles de recursos respetados.
* **Calidad general (10%):** Datos asimétricos, scripts comentados y organización.

*El proyecto se realiza en grupos de 2 a 3 estudiantes. Todos los scripts deben ejecutarse sin errores en Oracle. Todos los integrantes deben ser capaces de explicar cualquier parte del proyecto en la sustentación oral.*
