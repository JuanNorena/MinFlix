-- ============================================================================
-- MinFlix - Limpieza total del esquema MINFLIX_APP
-- Ejecutar como MINFLIX_APP en XEPDB1
-- ADVERTENCIA: Elimina todas las tablas, vistas, triggers y funciones
-- ============================================================================
-- Proposito: reiniciar el esquema para ejecuciones limpias entre iteraciones.
-- Estrategia: usar EXECUTE IMMEDIATE y capturar excepciones para no fallar
-- cuando el objeto no existe (script idempotente en la practica).
-- Nota: cada bloque PL/SQL termina con "/" para ejecutar en SQL*Plus/SQLcl.

-- --------------------------------------------------------------------------
-- 1) Triggers: se eliminan primero porque pueden depender de funciones/tablas.
-- --------------------------------------------------------------------------
-- Formato de bloque:
--   BEGIN EXECUTE IMMEDIATE 'DROP ...'; EXCEPTION WHEN OTHERS THEN NULL; END;
-- Esto evita fallos por objetos inexistentes durante la limpieza.
-- Cada bloque incluye una descripcion corta del objeto eliminado.
-- Nota: algunos nombres corresponden a objetos legacy de iteraciones previas.
-- --------------------------------------------------------------------------
-- TRG_LIMITE_PERFILES: trigger legacy de limite de perfiles (si existe).
BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_LIMITE_PERFILES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- TRG_ACTUALIZAR_FECHA_USUARIO: trigger legacy de timestamps en USUARIOS.
BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_ACTUALIZAR_FECHA_USUARIO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- TRG_PERFILES_LIMITE_PLAN_BI: valida el limite de perfiles por plan.
BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_PERFILES_LIMITE_PLAN_BI'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- TRG_REPRODUCCIONES_REGLAS_BIU: reglas de reproduccion y avances.
BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_REPRODUCCIONES_REGLAS_BIU'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- TRG_FAVORITOS_REGLAS_BI: valida favoritos segun clasificacion.
BEGIN EXECUTE IMMEDIATE 'DROP TRIGGER TRG_FAVORITOS_REGLAS_BI'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- --------------------------------------------------------------------------
-- 2) Vistas: se eliminan luego de triggers para liberar dependencias de lectura.
-- --------------------------------------------------------------------------
-- VW_CONTINUAR_VIENDO: fila de continuidad por perfil/contenido.
BEGIN EXECUTE IMMEDIATE 'DROP VIEW VW_CONTINUAR_VIENDO'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- VW_CONTENIDO_VISIBLE_POR_PERFIL: catalogo filtrado por clasificacion.
BEGIN EXECUTE IMMEDIATE 'DROP VIEW VW_CONTENIDO_VISIBLE_POR_PERFIL'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- --------------------------------------------------------------------------
-- 3) Funciones: utilidades de negocio que pueden ser referenciadas por vistas.
-- --------------------------------------------------------------------------
-- FN_CLASIFICACION_PERMITIDA_PARA_PERFIL: regla infantil vs clasificacion.
BEGIN EXECUTE IMMEDIATE 'DROP FUNCTION FN_CLASIFICACION_PERMITIDA_PARA_PERFIL'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- --------------------------------------------------------------------------
-- 4) Tablas: se eliminan en orden inverso para evitar conflictos de FK.
-- Nota: se incluyen nombres historicos (CONTENIDO/CONTENIDOS) por compatibilidad.
-- --------------------------------------------------------------------------
-- FAVORITOS: lista de favoritos por perfil.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE FAVORITOS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- REPRODUCCIONES: historial de consumo y progreso.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE REPRODUCCIONES CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- CONTENIDO_RELACIONADO: tabla legacy de relaciones editoriales.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CONTENIDO_RELACIONADO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- CONTENIDO_GENEROS: tabla legacy de relacion contenido-genero.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CONTENIDO_GENEROS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- EPISODIOS: episodios por temporada.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE EPISODIOS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- TEMPORADAS: temporadas de series/podcasts.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE TEMPORADAS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- CONTENIDO: tabla legacy del catalogo.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CONTENIDO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- CONTENIDOS: catalogo principal de la plataforma.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CONTENIDOS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- GENEROS: taxonomia de catalogo.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE GENEROS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- CATEGORIAS: clasificacion primaria del catalogo.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CATEGORIAS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- PERFILES: perfiles de reproduccion.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE PERFILES CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- USUARIOS: cuentas principales.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE USUARIOS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
-- PLANES: planes de suscripcion.
BEGIN EXECUTE IMMEDIATE 'DROP TABLE PLANES CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- --------------------------------------------------------------------------
-- 5) Verificacion final: confirma que no queden tablas del esquema.
-- --------------------------------------------------------------------------
SELECT 'Esquema limpio. Tablas restantes: ' || COUNT(*) AS RESULTADO
FROM USER_TABLES;
