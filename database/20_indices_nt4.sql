-- ============================================================================
-- MinFlix - Nucleo 4 Indices y Optimizacion (NT4)
-- Ejecutar como owner de tablas (MINFLIX_APP en XEPDB1).
-- Requiere: scripts 01..19 aplicados.
-- Objetivo:
--   1. Identificar una consulta pesada del dominio MinFlix.
--   2. Capturar EXPLAIN PLAN antes de crear indice.
--   3. Crear indice compuesto justificado para la consulta.
--   4. Capturar EXPLAIN PLAN despues del indice.
--   5. Documentar la mejora demostrable.
-- ============================================================================

SET SERVEROUTPUT ON;
-- DBMS_XPLAN muestra el plan de ejecucion de cada consulta evaluada.

-- ============================================================================
-- SECCION A: Consulta pesada seleccionada
-- ============================================================================
-- La consulta seleccionada es la de "historial de reproducciones por perfil"
-- con JOIN a contenidos, categorias y usuarios. Es frecuentemente usada por
-- PlaybackModule y por las vistas analiticas de consumo.
--
-- Consulta: lista las ultimas 50 reproducciones de un perfil especifico,
-- incluyendo titulo del contenido, categoria, ciudad del usuario y progreso.
-- ============================================================================

-- Definir el ID de perfil de prueba (ajustar segun seed real del ambiente)
DEFINE ID_PERFIL_PRUEBA = 1

-- Consulta pesada del dominio: historial de reproducciones por perfil.
-- Realiza 4 JOINs y ordena por FECHA_INICIO DESC, lo que genera alto costo.
-- FETCH FIRST 50 ROWS ONLY limita el resultado pero no reduce el costo del SORT.
SELECT
  R.ID_REPRODUCCION,        -- PK de la reproduccion
  C.TITULO,                 -- Titulo del contenido reproducido
  CAT.NOMBRE AS CATEGORIA,  -- Categoria del contenido (ej. Accion, Drama)
  U.CIUDAD_RESIDENCIA,      -- Ciudad del usuario titular
  R.PROGRESO_SEGUNDOS,      -- Segundos visionados en esta sesion
  R.PORCENTAJE_AVANCE,      -- Porcentaje de avance en la reproduccion
  R.ULTIMO_DISPOSITIVO,     -- Dispositivo desde el que se reprodujo
  R.FECHA_INICIO            -- Fecha y hora de inicio de la sesion
FROM REPRODUCCIONES R
-- JOIN obligatorio: traer titulo y datos del contenido
JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
-- JOIN obligatorio: traer nombre de la categoria del contenido
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
-- JOIN obligatorio: traer datos del perfil que reprodujo
JOIN PERFILES P ON P.ID_PERFIL = R.ID_PERFIL
-- JOIN obligatorio: traer ciudad de residencia del usuario titular
JOIN USUARIOS U ON U.ID_USUARIO = P.ID_USUARIO
-- Filtro por perfil especifico (parametro &&ID_PERFIL_PRUEBA)
WHERE R.ID_PERFIL = &&ID_PERFIL_PRUEBA
-- Ordenar de la mas reciente a la mas antigua
ORDER BY R.FECHA_INICIO DESC
-- Solo las ultimas 50 reproducciones del perfil
FETCH FIRST 50 ROWS ONLY;

-- ============================================================================
-- SECCION B: EXPLAIN PLAN antes del indice
-- ============================================================================

EXPLAIN PLAN FOR
SELECT
  R.ID_REPRODUCCION,
  C.TITULO,
  CAT.NOMBRE AS CATEGORIA,
  U.CIUDAD_RESIDENCIA,
  R.PROGRESO_SEGUNDOS,
  R.PORCENTAJE_AVANCE,
  R.ULTIMO_DISPOSITIVO,
  R.FECHA_INICIO
FROM REPRODUCCIONES R
JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
JOIN PERFILES P ON P.ID_PERFIL = R.ID_PERFIL
JOIN USUARIOS U ON U.ID_USUARIO = P.ID_USUARIO
WHERE R.ID_PERFIL = &&ID_PERFIL_PRUEBA
ORDER BY R.FECHA_INICIO DESC
FETCH FIRST 50 ROWS ONLY;

-- Visualizar el plan de ejecucion antes del indice
SELECT
  PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

-- ============================================================================
-- SECCION C: Creacion del indice adicional justificado
-- ============================================================================
-- Justificacion:
--   La consulta filtra por ID_PERFIL (WHERE) y ordena por FECHA_INICIO DESC (ORDER BY).
--   Aunque existe IDX_REPRODUCCIONES_PERFIL_EVENTO (ID_PERFIL, FECHA_ULTIMO_EVENTO),
--   no cubre la columna FECHA_INICIO que se usa en el ORDER BY de esta consulta.
--   El nuevo indice compuesto (ID_PERFIL, FECHA_INICIO DESC) cubre ambas clausulas,
--   permitiendo un INDEX RANGE SCAN seguido de un INDEX FULL SCAN DESCENDING,
--   evitando asi el SORT OPERATION costoso y reduciendo el acceso a la tabla.
-- ============================================================================

DECLARE
  -- Variable para verificar si el indice ya existe (idempotencia)
  V_EXISTE NUMBER := 0;
BEGIN
  -- Consultar diccionario de datos para verificar existencia previa del indice
  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_INDEXES
   WHERE INDEX_NAME = 'IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO';

  -- Crear indice solo si no existe (evita ORA-00955 en re-ejecuciones)
  IF V_EXISTE = 0 THEN
    -- DDL dinamico: ejecuta CREATE INDEX en tiempo de ejecucion
    EXECUTE IMMEDIATE '
      CREATE INDEX IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO
      ON REPRODUCCIONES (ID_PERFIL, FECHA_INICIO DESC)';
  END IF;
END;
/

-- ============================================================================
-- SECCION D: EXPLAIN PLAN despues del indice
-- ============================================================================

EXPLAIN PLAN FOR
SELECT
  R.ID_REPRODUCCION,
  C.TITULO,
  CAT.NOMBRE AS CATEGORIA,
  U.CIUDAD_RESIDENCIA,
  R.PROGRESO_SEGUNDOS,
  R.PORCENTAJE_AVANCE,
  R.ULTIMO_DISPOSITIVO,
  R.FECHA_INICIO
FROM REPRODUCCIONES R
JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
JOIN PERFILES P ON P.ID_PERFIL = R.ID_PERFIL
JOIN USUARIOS U ON U.ID_USUARIO = P.ID_USUARIO
WHERE R.ID_PERFIL = &&ID_PERFIL_PRUEBA
ORDER BY R.FECHA_INICIO DESC
FETCH FIRST 50 ROWS ONLY;

-- Visualizar el plan de ejecucion despues del indice
SELECT
  PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

-- ============================================================================
-- SECCION E: Segundo indice justificado — Catalogo por categoria y ano
-- ============================================================================
-- Justificacion:
--   La pagina de browse filtra frecuentemente por categoria y ano de lanzamiento.
--   Sin indice, Oracle realiza FULL TABLE SCAN sobre CONTENIDOS.
--   El indice compuesto acelera ambas clausulas de filtro.
-- ============================================================================

-- EXPLAIN PLAN antes (sin indice sobre CONTENIDOS)
EXPLAIN PLAN FOR
SELECT
  C.ID_CONTENIDO,
  C.TITULO,
  C.ANIO_LANZAMIENTO,
  C.CLASIFICACION_EDAD,
  CAT.NOMBRE AS CATEGORIA
FROM CONTENIDOS C
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
WHERE C.ID_CATEGORIA = 1
  AND C.ANIO_LANZAMIENTO >= 2020
ORDER BY C.ANIO_LANZAMIENTO DESC
FETCH FIRST 20 ROWS ONLY;

SELECT PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

-- Crear indice compuesto de forma idempotente.
-- Verifica USER_INDEXES antes de ejecutar DDL para evitar ORA-00955.
DECLARE
  -- Flag de existencia del indice
  V_EXISTE NUMBER := 0;
BEGIN
  -- Consultar diccionario de datos para verificar existencia previa
  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_INDEXES
   WHERE INDEX_NAME = 'IDX_CONTENIDOS_CATEGORIA_ANIO';

  -- Crear indice solo si no existe
  IF V_EXISTE = 0 THEN
    -- DDL dinamico: indice compuesto para filtro por categoria + orden por anio
    EXECUTE IMMEDIATE '
      CREATE INDEX IDX_CONTENIDOS_CATEGORIA_ANIO
      ON CONTENIDOS (ID_CATEGORIA, ANIO_LANZAMIENTO DESC)';
  END IF;
END;
/

-- EXPLAIN PLAN despues (con indice)
EXPLAIN PLAN FOR
SELECT
  C.ID_CONTENIDO,
  C.TITULO,
  C.ANIO_LANZAMIENTO,
  C.CLASIFICACION_EDAD,
  CAT.NOMBRE AS CATEGORIA
FROM CONTENIDOS C
JOIN CATEGORIAS CAT ON CAT.ID_CATEGORIA = C.ID_CATEGORIA
WHERE C.ID_CATEGORIA = 1
  AND C.ANIO_LANZAMIENTO >= 2020
ORDER BY C.ANIO_LANZAMIENTO DESC
FETCH FIRST 20 ROWS ONLY;

SELECT PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

-- ============================================================================
-- SECCION F: Tercer indice justificado — Usuarios por estado y ciudad
-- ============================================================================
-- Justificacion:
--   Las vistas analiticas VW_ANALITICA_CONSUMO y VW_ANALITICA_FINANZAS
--   agrupan frecuentemente por CIUDAD_RESIDENCIA y ESTADO_CUENTA.
--   El indice acelera los filtros WHERE UPPER(CIUDAD_RESIDENCIA) = ...
-- ============================================================================

EXPLAIN PLAN FOR
SELECT
  U.CIUDAD_RESIDENCIA,
  COUNT(DISTINCT U.ID_USUARIO) AS USUARIOS_ACTIVOS
FROM USUARIOS U
WHERE U.ESTADO_CUENTA = 'ACTIVO'
  AND UPPER(U.CIUDAD_RESIDENCIA) = 'BOGOTA'
GROUP BY U.CIUDAD_RESIDENCIA;

SELECT PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

DECLARE
  -- Flag de existencia del indice
  V_EXISTE NUMBER := 0;
BEGIN
  -- Consultar diccionario de datos para verificar existencia previa
  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_INDEXES
   WHERE INDEX_NAME = 'IDX_USUARIOS_CIUDAD_ESTADO';

  -- Crear indice solo si no existe
  IF V_EXISTE = 0 THEN
    -- DDL dinamico: indice con UPPER para acelerar filtros case-insensitive
    EXECUTE IMMEDIATE '
      CREATE INDEX IDX_USUARIOS_CIUDAD_ESTADO
      ON USUARIOS (UPPER(CIUDAD_RESIDENCIA), ESTADO_CUENTA)';
  END IF;
END;
/

EXPLAIN PLAN FOR
SELECT
  U.CIUDAD_RESIDENCIA,
  COUNT(DISTINCT U.ID_USUARIO) AS USUARIOS_ACTIVOS
FROM USUARIOS U
WHERE U.ESTADO_CUENTA = 'ACTIVO'
  AND UPPER(U.CIUDAD_RESIDENCIA) = 'BOGOTA'
GROUP BY U.CIUDAD_RESIDENCIA;

SELECT PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

-- ============================================================================
-- SECCION G: Cuarto indice justificado — Calificaciones por contenido
-- ============================================================================
-- Justificacion:
--   La vista materializada MV_CALIFICACIONES_PROMEDIO y las consultas
--   de detalle de contenido agrupan calificaciones por ID_CONTENIDO.
--   El indice acelera los JOINs y las agregaciones AVG/COUNT.
-- ============================================================================

EXPLAIN PLAN FOR
SELECT
  C.ID_CONTENIDO,
  C.TITULO,
  ROUND(AVG(CAL.PUNTAJE), 2) AS PROMEDIO,
  COUNT(CAL.ID_CALIFICACION) AS TOTAL
FROM CONTENIDOS C
LEFT JOIN CALIFICACIONES CAL ON CAL.ID_CONTENIDO = C.ID_CONTENIDO
WHERE C.ID_CONTENIDO = 1
GROUP BY C.ID_CONTENIDO, C.TITULO;

SELECT PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

DECLARE
  -- Flag de existencia del indice
  V_EXISTE NUMBER := 0;
BEGIN
  -- Consultar diccionario de datos para verificar existencia previa
  SELECT COUNT(*)
    INTO V_EXISTE
    FROM USER_INDEXES
   WHERE INDEX_NAME = 'IDX_CALIFICACIONES_CONTENIDO_FECHA';

  -- Crear indice solo si no existe
  IF V_EXISTE = 0 THEN
    -- DDL dinamico: indice para acelerar JOINs y agregaciones AVG/COUNT por contenido
    EXECUTE IMMEDIATE '
      CREATE INDEX IDX_CALIFICACIONES_CONTENIDO_FECHA
      ON CALIFICACIONES (ID_CONTENIDO, FECHA_CALIFICACION DESC)';
  END IF;
END;
/

EXPLAIN PLAN FOR
SELECT
  C.ID_CONTENIDO,
  C.TITULO,
  ROUND(AVG(CAL.PUNTAJE), 2) AS PROMEDIO,
  COUNT(CAL.ID_CALIFICACION) AS TOTAL
FROM CONTENIDOS C
LEFT JOIN CALIFICACIONES CAL ON CAL.ID_CONTENIDO = C.ID_CONTENIDO
WHERE C.ID_CONTENIDO = 1
GROUP BY C.ID_CONTENIDO, C.TITULO;

SELECT PLAN_TABLE_OUTPUT
FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE', NULL, 'BASIC +COST'));

-- ============================================================================
-- Resumen de indices creados en este script
-- ============================================================================

SELECT INDEX_NAME, TABLE_NAME, COLUMN_NAME, DESCEND
  FROM USER_IND_COLUMNS
 WHERE INDEX_NAME IN (
   'IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO',
   'IDX_CONTENIDOS_CATEGORIA_ANIO',
   'IDX_USUARIOS_CIUDAD_ESTADO',
   'IDX_CALIFICACIONES_CONTENIDO_FECHA'
 )
 ORDER BY INDEX_NAME, COLUMN_POSITION;

COMMIT;
