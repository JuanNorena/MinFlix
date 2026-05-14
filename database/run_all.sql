-- ============================================================================
-- MinFlix - Runner de Cierre para Oracle SQLcl/SQL*Plus
-- Ejecutar desde la carpeta database/ con el owner real de objetos MinFlix
-- o con un usuario con privilegios suficientes para crear roles/usuarios.
--
-- Importante:
-- - No ejecuta 00_drop_all.sql. Ese script es destructivo y debe correrse solo
--   manualmente si se desea reiniciar el esquema.
-- - El script 01 contiene comentarios para crear MINFLIX_APP; si el owner ya
--   existe, conectarse como ese owner antes de ejecutar este runner.
-- - El script 11 crea roles/usuarios de BD; requiere privilegios administrativos.
-- ============================================================================

-- Detener el runner si ocurre cualquier error SQL.
WHENEVER SQLERROR EXIT SQL.SQLCODE;

-- Configuracion basica para ejecucion con SQLcl/SQL*Plus.
SET SERVEROUTPUT ON;
SET DEFINE ON;

PROMPT ========================================================================
PROMPT MinFlix - Inicio runner completo 01..21
PROMPT ========================================================================

PROMPT Ejecutando 01_bootstrap_oracle_iteracion1.sql
-- @@ ejecuta el archivo relativo a la ruta actual (database/).
@@01_bootstrap_oracle_iteracion1.sql

PROMPT Ejecutando 02_catalogo_base_iteracion2.sql
@@02_catalogo_base_iteracion2.sql

PROMPT Ejecutando 03_reglas_perfiles_iteracion1.sql
@@03_reglas_perfiles_iteracion1.sql

PROMPT Ejecutando 04_reproducciones_iteracion2.sql
@@04_reproducciones_iteracion2.sql

PROMPT Ejecutando 05_comunidad_favoritos_iteracion3.sql
@@05_comunidad_favoritos_iteracion3.sql

PROMPT Ejecutando 06_comunidad_calificaciones_iteracion3.sql
@@06_comunidad_calificaciones_iteracion3.sql

PROMPT Ejecutando 07_catalogo_extendido_iteracion4.sql
@@07_catalogo_extendido_iteracion4.sql

PROMPT Ejecutando 08_comunidad_reportes_moderacion_iteracion4.sql
@@08_comunidad_reportes_moderacion_iteracion4.sql

PROMPT Ejecutando 09_finanzas_referidos_iteracion5.sql
@@09_finanzas_referidos_iteracion5.sql

PROMPT Ejecutando 10_organizacion_equipo_iteracion5.sql
@@10_organizacion_equipo_iteracion5.sql

PROMPT Ejecutando 11_seguridad_roles_nt5.sql
@@11_seguridad_roles_nt5.sql

PROMPT Ejecutando 12_diccionario_comentarios_modelo_fisico.sql
@@12_diccionario_comentarios_modelo_fisico.sql

PROMPT Ejecutando 13_seed_usuarios_roles_login_iteracion5.sql
@@13_seed_usuarios_roles_login_iteracion5.sql

PROMPT Ejecutando 14_seed_datos_funcionales_iteracion5.sql
@@14_seed_datos_funcionales_iteracion5.sql

PROMPT Ejecutando 15_finanzas_vistas_api_iteracion6.sql
@@15_finanzas_vistas_api_iteracion6.sql

PROMPT Ejecutando 16_usuarios_datos_personales_iteracion6.sql
@@16_usuarios_datos_personales_iteracion6.sql

PROMPT Ejecutando 17_analitica_nt1.sql
@@17_analitica_nt1.sql

PROMPT Ejecutando 18_plsql_nt2_completo.sql
@@18_plsql_nt2_completo.sql

PROMPT Ejecutando 19_transacciones_nt3.sql
@@19_transacciones_nt3.sql

PROMPT Ejecutando 20_indices_nt4.sql
@@20_indices_nt4.sql

PROMPT Recompilando dependencias finales de analitica
ALTER TRIGGER TRG_CALIFICACIONES_REGLAS_BIU COMPILE;
ALTER MATERIALIZED VIEW MV_CALIFICACIONES_PROMEDIO COMPILE;
ALTER MATERIALIZED VIEW MV_METRICAS_FINANCIERAS COMPILE;
BEGIN
  DBMS_MVIEW.REFRESH('MV_CALIFICACIONES_PROMEDIO', 'C');
  DBMS_MVIEW.REFRESH('MV_METRICAS_FINANCIERAS', 'C');
END;
/
ALTER MATERIALIZED VIEW MV_CALIFICACIONES_PROMEDIO COMPILE;
ALTER MATERIALIZED VIEW MV_METRICAS_FINANCIERAS COMPILE;

PROMPT Ejecutando 21_validacion_cierre.sql
@@21_validacion_cierre.sql

PROMPT ========================================================================
PROMPT MinFlix - Runner completo finalizado correctamente
PROMPT ========================================================================
