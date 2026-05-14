-- ============================================================================
-- MinFlix - Validacion de Cierre del Proyecto
-- Ejecutar como owner de objetos o usuario con permisos de lectura sobre el
-- esquema MinFlix despues de aplicar scripts 01..20.
-- Objetivo:
--   1) Validar contexto de conexion Oracle.
--   2) Validar existencia y estado de tablas, vistas, MVs, funciones,
--      procedimientos, triggers e indices.
--   3) Validar permisos concedidos a roles funcionales.
--   4) Validar datos semilla minimos para probar frontend/backend.
-- ============================================================================

SET SERVEROUTPUT ON;
-- Este script es de solo lectura y sirve como checklist final.

PROMPT ========================================================================
PROMPT 1. CONTEXTO DE CONEXION
PROMPT ========================================================================
-- Verifica usuario, contenedor y esquema actual para evitar ejecuciones erradas.

-- Verificar usuario Oracle conectado (debe ser MINFLIX_APP o owner del esquema)
SELECT USER AS USUARIO_CONECTADO FROM DUAL;

-- Verificar nombre del contenedor PDB (debe ser XEPDB1 en entornos XE)
SELECT SYS_CONTEXT('USERENV', 'CON_NAME') AS CONTENEDOR
  FROM DUAL;

-- Verificar esquema actual de ejecucion (debe coincidir con el usuario conectado)
SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS ESQUEMA_ACTUAL
  FROM DUAL;

PROMPT ========================================================================
PROMPT 2. ESTADO DE OBJETOS PRINCIPALES
PROMPT ========================================================================
-- Esperado: STATUS = VALID para tablas, vistas, MVs y programas.

-- Verificar que todos los objetos principales existen y estan VALID (no invalidos).
-- STATUS = VALID significa que el objeto se compilo correctamente.
-- Si hay STATUS = INVALID, recompilar con: ALTER <tipo> <nombre> COMPILE;
SELECT OBJECT_TYPE, OBJECT_NAME, STATUS
  FROM USER_OBJECTS
 WHERE OBJECT_NAME IN (
   -- Tablas del dominio
   'USUARIOS', 'PLANES', 'PERFILES', 'CATEGORIAS', 'CONTENIDOS',
   'GENEROS', 'CONTENIDOS_GENEROS', 'TEMPORADAS', 'EPISODIOS',
   'CONTENIDOS_RELACIONADOS', 'REPRODUCCIONES', 'FAVORITOS',
   'CALIFICACIONES', 'REPORTES', 'REFERIDOS', 'FACTURACIONES',
   'PAGOS', 'DEPARTAMENTOS', 'EMPLEADOS',
   -- Vistas API y analiticas
   'VW_CONTENIDO_VISIBLE_POR_PERFIL', 'VW_CONTINUAR_VIENDO',
   'VW_REPORTES_PENDIENTES_SOPORTE', 'VW_FIN_RESUMEN_USUARIO',
   'VW_FIN_FACTURAS_DETALLE', 'VW_FIN_PAGOS_DETALLE',
   'VW_FIN_REFERIDOS_DETALLE', 'VW_ANALITICA_CONSUMO',
   'VW_ANALITICA_FINANZAS', 'VW_ANALITICA_RENDIMIENTO',
   -- Vistas materializadas
   'MV_CALIFICACIONES_PROMEDIO', 'MV_METRICAS_FINANCIERAS',
   -- Procedimientos y funciones PL/SQL
   'SP_APLICAR_MORA_CUENTAS', 'SP_REGISTRAR_USUARIO', 'SP_CAMBIAR_PLAN',
   'FN_CLASIFICACION_PERMITIDA_PARA_PERFIL', 'FN_CALCULAR_MONTO',
   'FN_CONTENIDO_RECOMENDADO'
 )
 ORDER BY OBJECT_TYPE, OBJECT_NAME;

PROMPT ========================================================================
PROMPT 3. ERRORES DE COMPILACION
PROMPT ========================================================================
-- Esperado: cero filas en USER_ERRORS.

-- Verificar errores de compilacion en objetos PL/SQL.
-- Resultado esperado: cero filas (ningun objeto con error de compilacion).
-- Si hay errores, corregir el codigo fuente y recompilar.
SELECT NAME, TYPE, LINE, POSITION, TEXT
  FROM USER_ERRORS
 ORDER BY NAME, TYPE, SEQUENCE;

PROMPT ========================================================================
PROMPT 4. CONTEO DE DATOS OPERATIVOS
PROMPT ========================================================================
-- Esperado: conteos > 0 para tablas base y seeds.

-- Contar registros en cada tabla operativa para verificar que el seed se aplico.
-- Resultado esperado: valores > 0 en tablas base (PLANES, CATEGORIAS, CONTENIDOS, etc.).
-- Si hay 0 filas en tablas base, ejecutar el script de seed (14_seed_datos_funcionales).
SELECT 'USUARIOS' AS OBJETO, COUNT(*) AS FILAS FROM USUARIOS
UNION ALL SELECT 'PERFILES', COUNT(*) FROM PERFILES
UNION ALL SELECT 'PLANES', COUNT(*) FROM PLANES
UNION ALL SELECT 'CATEGORIAS', COUNT(*) FROM CATEGORIAS
UNION ALL SELECT 'CONTENIDOS', COUNT(*) FROM CONTENIDOS
UNION ALL SELECT 'GENEROS', COUNT(*) FROM GENEROS
UNION ALL SELECT 'CONTENIDOS_GENEROS', COUNT(*) FROM CONTENIDOS_GENEROS
UNION ALL SELECT 'TEMPORADAS', COUNT(*) FROM TEMPORADAS
UNION ALL SELECT 'EPISODIOS', COUNT(*) FROM EPISODIOS
UNION ALL SELECT 'CONTENIDOS_RELACIONADOS', COUNT(*) FROM CONTENIDOS_RELACIONADOS
UNION ALL SELECT 'REPRODUCCIONES', COUNT(*) FROM REPRODUCCIONES
UNION ALL SELECT 'FAVORITOS', COUNT(*) FROM FAVORITOS
UNION ALL SELECT 'CALIFICACIONES', COUNT(*) FROM CALIFICACIONES
UNION ALL SELECT 'REPORTES', COUNT(*) FROM REPORTES
UNION ALL SELECT 'FACTURACIONES', COUNT(*) FROM FACTURACIONES
UNION ALL SELECT 'PAGOS', COUNT(*) FROM PAGOS
UNION ALL SELECT 'REFERIDOS', COUNT(*) FROM REFERIDOS
UNION ALL SELECT 'DEPARTAMENTOS', COUNT(*) FROM DEPARTAMENTOS
UNION ALL SELECT 'EMPLEADOS', COUNT(*) FROM EMPLEADOS
ORDER BY OBJETO;

PROMPT ========================================================================
PROMPT 5. VALIDACION DE VISTAS API Y ANALITICAS
PROMPT ========================================================================
-- Esperado: COUNT(*) sin ORA-00942/ORA-04063.

-- Verificar que las vistas y vistas materializadas responden sin errores.
-- ORA-00942: tabla o vista no existe (falta crear la vista).
-- ORA-04063: vista tiene errores de compilacion (recompilar con ALTER VIEW ... COMPILE).
-- Resultado esperado: COUNT(*) exitoso para cada vista (puede ser 0 si no hay datos).
SELECT 'VW_CONTINUAR_VIENDO' AS VISTA, COUNT(*) AS FILAS FROM VW_CONTINUAR_VIENDO
UNION ALL SELECT 'VW_REPORTES_PENDIENTES_SOPORTE', COUNT(*) FROM VW_REPORTES_PENDIENTES_SOPORTE
UNION ALL SELECT 'VW_FIN_RESUMEN_USUARIO', COUNT(*) FROM VW_FIN_RESUMEN_USUARIO
UNION ALL SELECT 'VW_FIN_FACTURAS_DETALLE', COUNT(*) FROM VW_FIN_FACTURAS_DETALLE
UNION ALL SELECT 'VW_FIN_PAGOS_DETALLE', COUNT(*) FROM VW_FIN_PAGOS_DETALLE
UNION ALL SELECT 'VW_FIN_REFERIDOS_DETALLE', COUNT(*) FROM VW_FIN_REFERIDOS_DETALLE
UNION ALL SELECT 'VW_ANALITICA_CONSUMO', COUNT(*) FROM VW_ANALITICA_CONSUMO
UNION ALL SELECT 'VW_ANALITICA_FINANZAS', COUNT(*) FROM VW_ANALITICA_FINANZAS
UNION ALL SELECT 'VW_ANALITICA_RENDIMIENTO', COUNT(*) FROM VW_ANALITICA_RENDIMIENTO
UNION ALL SELECT 'MV_CALIFICACIONES_PROMEDIO', COUNT(*) FROM MV_CALIFICACIONES_PROMEDIO
UNION ALL SELECT 'MV_METRICAS_FINANCIERAS', COUNT(*) FROM MV_METRICAS_FINANCIERAS
ORDER BY VISTA;

PROMPT ========================================================================
PROMPT 6. VALIDACION DE USUARIOS SEMILLA DE APLICACION
PROMPT ========================================================================
-- Esperado: 5 cuentas seed con roles distintos y perfiles asociados.

SELECT EMAIL, ROL, ESTADO_CUENTA, ID_PLAN
  FROM USUARIOS
 WHERE EMAIL IN (
   'admin.seed@minflix.local',
   'analista.seed@minflix.local',
   'soporte.seed@minflix.local',
   'contenido.seed@minflix.local',
   'usuario.seed@minflix.local'
 )
 ORDER BY ROL, EMAIL;

SELECT U.EMAIL, P.ID_PERFIL, P.NOMBRE, P.TIPO_PERFIL
  FROM USUARIOS U
  JOIN PERFILES P
    ON P.ID_USUARIO = U.ID_USUARIO
 WHERE U.EMAIL IN (
   'admin.seed@minflix.local',
   'analista.seed@minflix.local',
   'soporte.seed@minflix.local',
   'contenido.seed@minflix.local',
   'usuario.seed@minflix.local'
 )
 ORDER BY U.EMAIL, P.ID_PERFIL;

PROMPT ========================================================================
PROMPT 7. VALIDACION DE CATALOGO EXTENDIDO PARA FRONTEND
PROMPT ========================================================================
-- Esperado: registros de generos, temporadas, episodios y relaciones.

SELECT C.TITULO, G.NOMBRE AS GENERO
  FROM CONTENIDOS C
  JOIN CONTENIDOS_GENEROS CG
    ON CG.ID_CONTENIDO = C.ID_CONTENIDO
  JOIN GENEROS G
    ON G.ID_GENERO = CG.ID_GENERO
 ORDER BY C.TITULO, G.NOMBRE
 FETCH FIRST 30 ROWS ONLY;

SELECT C.TITULO,
       T.NUMERO_TEMPORADA,
       T.TITULO AS TITULO_TEMPORADA,
       E.NUMERO_EPISODIO,
       E.TITULO AS TITULO_EPISODIO
  FROM CONTENIDOS C
  JOIN TEMPORADAS T
    ON T.ID_CONTENIDO = C.ID_CONTENIDO
  JOIN EPISODIOS E
    ON E.ID_TEMPORADA = T.ID_TEMPORADA
 ORDER BY C.TITULO, T.NUMERO_TEMPORADA, E.NUMERO_EPISODIO
 FETCH FIRST 30 ROWS ONLY;

SELECT CO.TITULO AS CONTENIDO_ORIGEN,
       CR.TIPO_RELACION,
       CD.TITULO AS CONTENIDO_RELACIONADO
  FROM CONTENIDOS_RELACIONADOS CR
  JOIN CONTENIDOS CO
    ON CO.ID_CONTENIDO = CR.ID_CONTENIDO_ORIGEN
  JOIN CONTENIDOS CD
    ON CD.ID_CONTENIDO = CR.ID_CONTENIDO_RELACIONADO
 ORDER BY CO.TITULO, CR.TIPO_RELACION, CD.TITULO;

PROMPT ========================================================================
PROMPT 8. VALIDACION DE GRANTS A ROLES FUNCIONALES
PROMPT ========================================================================
-- Esperado: privilegios asignados a roles segun NT5.

SELECT GRANTEE, TABLE_NAME, PRIVILEGE
  FROM USER_TAB_PRIVS_MADE
 WHERE GRANTEE IN ('ROL_ADMIN', 'ROL_ANALISTA', 'ROL_SOPORTE', 'ROL_CONTENIDO')
   AND TABLE_NAME IN (
     'USUARIOS',
     'PERFILES',
     'CONTENIDOS',
     'GENEROS',
     'CONTENIDOS_GENEROS',
     'TEMPORADAS',
     'EPISODIOS',
     'CONTENIDOS_RELACIONADOS',
     'REPORTES',
     'FACTURACIONES',
     'PAGOS',
     'VW_REPORTES_PENDIENTES_SOPORTE',
     'VW_FIN_RESUMEN_USUARIO',
     'VW_FIN_FACTURAS_DETALLE',
     'VW_FIN_PAGOS_DETALLE',
     'VW_FIN_REFERIDOS_DETALLE',
     'VW_ANALITICA_CONSUMO',
     'VW_ANALITICA_FINANZAS',
     'VW_ANALITICA_RENDIMIENTO',
     'MV_CALIFICACIONES_PROMEDIO',
     'MV_METRICAS_FINANCIERAS',
     'SP_REGISTRAR_USUARIO',
     'SP_CAMBIAR_PLAN',
     'FN_CALCULAR_MONTO',
     'FN_CONTENIDO_RECOMENDADO'
   )
 ORDER BY GRANTEE, TABLE_NAME, PRIVILEGE;

PROMPT ========================================================================
PROMPT 9. VALIDACION DE INDICES NT4
PROMPT ========================================================================
-- Esperado: indices NT4 en estado VALID.

SELECT I.INDEX_NAME,
       I.TABLE_NAME,
       I.STATUS,
       LISTAGG(C.COLUMN_NAME || ' ' || C.DESCEND, ', ')
         WITHIN GROUP (ORDER BY C.COLUMN_POSITION) AS COLUMNAS
  FROM USER_INDEXES I
  JOIN USER_IND_COLUMNS C
    ON C.INDEX_NAME = I.INDEX_NAME
 WHERE I.INDEX_NAME IN (
   'IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO',
   'IDX_CONTENIDOS_CATEGORIA_ANIO',
   'IDX_USUARIOS_CIUDAD_ESTADO',
   'IDX_CALIFICACIONES_CONTENIDO_FECHA'
 )
 GROUP BY I.INDEX_NAME, I.TABLE_NAME, I.STATUS
 ORDER BY I.INDEX_NAME;

PROMPT ========================================================================
PROMPT 10. RESULTADO ESPERADO
PROMPT ========================================================================
PROMPT - USER_ERRORS debe retornar cero filas.
PROMPT - Todas las vistas/MVs deben responder COUNT(*) sin ORA-00942/ORA-04063.
PROMPT - Los usuarios seed deben existir con roles admin, analista, soporte,
PROMPT   contenido y usuario.
PROMPT - Los grants deben cubrir roles funcionales para vistas y objetos usados.
PROMPT - Los indices NT4 deben aparecer VALID.
