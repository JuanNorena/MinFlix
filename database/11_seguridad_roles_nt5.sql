-- ============================================================================
-- MinFlix - Nucleo 5 (Seguridad de Acceso: PROFILE, Roles, Usuarios y GRANT)
-- Ejecutar como SYSTEM.
-- Requiere: scripts 01..10 ejecutados en el owner de objetos (SYSTEM en entorno actual).
-- ============================================================================
-- Este script es idempotente: cada bloque CREATE captura el error "ya existe".

-- --------------------------------------------------------------------------
-- PROFILE de seguridad
-- --------------------------------------------------------------------------
-- Perfil PRF_MINFLIX_OPERACION:
--   - limite de 3 sesiones por usuario,
--   - 30 minutos de inactividad,
--   - politicas de contrasena y reutilizacion.
BEGIN
  EXECUTE IMMEDIATE q'[
    CREATE PROFILE PRF_MINFLIX_OPERACION LIMIT
      SESSIONS_PER_USER 3              -- Maxim 3 sesiones concurrentes por usuario
      IDLE_TIME 30                      -- Desconectar si inactivo 30 minutos
      FAILED_LOGIN_ATTEMPTS 5           -- Bloquear cuenta tras 5 intentos fallidos de login
      PASSWORD_LIFE_TIME 180            -- Cambio obligatorio de password cada 180 dias
      PASSWORD_REUSE_TIME 365           -- No reutilizar password anterior durante 365 dias
      PASSWORD_REUSE_MAX 5              -- Recordar ultimas 5 passwords
      CONNECT_TIME UNLIMITED            -- Sin limite de tiempo de conexion total
  ]';
EXCEPTION
  WHEN OTHERS THEN
    -- ORA-02379: profile ya existe.
    IF SQLCODE != -2379 THEN
      RAISE;
    END IF;
END;
/

-- --------------------------------------------------------------------------
-- Roles requeridos por el enunciado
-- --------------------------------------------------------------------------
-- Cada bloque CREATE ROLE ignora ORA-01921 (rol ya existe).
BEGIN
  EXECUTE IMMEDIATE 'CREATE ROLE ROL_ADMIN';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1921 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE ROLE ROL_ANALISTA';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1921 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE ROLE ROL_SOPORTE';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1921 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE ROLE ROL_CONTENIDO';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1921 THEN
      RAISE;
    END IF;
END;
/

-- --------------------------------------------------------------------------
-- GRANT por rol
-- --------------------------------------------------------------------------
-- ADMIN: acceso operativo amplio
-- CRUD sobre todas las tablas operativas + vistas + ejecucion de funciones.
-- Puede leer, crear, modificar y eliminar cualquier entidad de la plataforma.
GRANT SELECT, INSERT, UPDATE, DELETE ON USUARIOS TO ROL_ADMIN;             -- Gestion completa de usuarios
GRANT SELECT, INSERT, UPDATE, DELETE ON PERFILES TO ROL_ADMIN;             -- Gestion completa de perfiles
GRANT SELECT, INSERT, UPDATE, DELETE ON PLANES TO ROL_ADMIN;               -- Gestion completa de planes
GRANT SELECT, INSERT, UPDATE, DELETE ON CATEGORIAS TO ROL_ADMIN;           -- Gestion de categorias de contenido
GRANT SELECT, INSERT, UPDATE, DELETE ON CONTENIDOS TO ROL_ADMIN;           -- Gestion completa de contenidos
GRANT SELECT, INSERT, UPDATE, DELETE ON GENEROS TO ROL_ADMIN;              -- Gestion de generos
GRANT SELECT, INSERT, UPDATE, DELETE ON CONTENIDOS_GENEROS TO ROL_ADMIN;   -- Asignacion de generos a contenidos
GRANT SELECT, INSERT, UPDATE, DELETE ON TEMPORADAS TO ROL_ADMIN;           -- Gestion de temporadas de series
GRANT SELECT, INSERT, UPDATE, DELETE ON EPISODIOS TO ROL_ADMIN;            -- Gestion de episodios
GRANT SELECT, INSERT, UPDATE, DELETE ON CONTENIDOS_RELACIONADOS TO ROL_ADMIN; -- Configurar relaciones entre contenidos
GRANT SELECT, INSERT, UPDATE, DELETE ON REPRODUCCIONES TO ROL_ADMIN;       -- Gestion de historial de reproducciones
GRANT SELECT, INSERT, UPDATE, DELETE ON FAVORITOS TO ROL_ADMIN;            -- Gestion de favoritos
GRANT SELECT, INSERT, UPDATE, DELETE ON CALIFICACIONES TO ROL_ADMIN;       -- Gestion de calificaciones y resenas
GRANT SELECT, INSERT, UPDATE, DELETE ON REPORTES TO ROL_ADMIN;             -- Gestion de reportes de moderacion
GRANT SELECT, INSERT, UPDATE, DELETE ON REFERIDOS TO ROL_ADMIN;            -- Gestion del programa de referidos
GRANT SELECT, INSERT, UPDATE, DELETE ON FACTURACIONES TO ROL_ADMIN;        -- Gestion de facturas
GRANT SELECT, INSERT, UPDATE, DELETE ON PAGOS TO ROL_ADMIN;                -- Gestion de pagos y transacciones
GRANT SELECT, INSERT, UPDATE, DELETE ON DEPARTAMENTOS TO ROL_ADMIN;        -- Gestion de departamentos de equipo
GRANT SELECT, INSERT, UPDATE, DELETE ON EMPLEADOS TO ROL_ADMIN;            -- Gestion de empleados internos
GRANT SELECT ON VW_CONTENIDO_VISIBLE_POR_PERFIL TO ROL_ADMIN;             -- Ver contenidos por restriccion de perfil
GRANT SELECT ON VW_CONTINUAR_VIENDO TO ROL_ADMIN;                          -- Ver historial de "continue watching"
GRANT SELECT ON VW_REPORTES_PENDIENTES_SOPORTE TO ROL_ADMIN;              -- Ver reportes pendientes para equipo soporte
GRANT EXECUTE ON FN_CLASIFICACION_PERMITIDA_PARA_PERFIL TO ROL_ADMIN;     -- Ejecutar validacion de clasificacion por edad
GRANT EXECUTE ON SP_APLICAR_MORA_CUENTAS TO ROL_ADMIN;                     -- Ejecutar procedimiento de cobranza

-- ANALISTA: solo lectura sobre datos consolidados y operativos
-- Ideal para analitica y reportes sin modificacion de datos.
-- No puede crear, modificar ni eliminar; solo consultar y generar reportes.
GRANT SELECT ON PLANES TO ROL_ANALISTA;                              -- Consultar planes disponibles
GRANT SELECT ON USUARIOS TO ROL_ANALISTA;                            -- Consultar datos de usuarios
GRANT SELECT ON PERFILES TO ROL_ANALISTA;                            -- Consultar perfiles
GRANT SELECT ON CATEGORIAS TO ROL_ANALISTA;                          -- Consultar categorias
GRANT SELECT ON CONTENIDOS TO ROL_ANALISTA;                          -- Consultar contenidos
GRANT SELECT ON GENEROS TO ROL_ANALISTA;                             -- Consultar generos
GRANT SELECT ON CONTENIDOS_GENEROS TO ROL_ANALISTA;                  -- Consultar relacion generos-contenidos
GRANT SELECT ON TEMPORADAS TO ROL_ANALISTA;                          -- Consultar temporadas
GRANT SELECT ON EPISODIOS TO ROL_ANALISTA;                           -- Consultar episodios
GRANT SELECT ON CONTENIDOS_RELACIONADOS TO ROL_ANALISTA;             -- Consultar contenidos relacionados
GRANT SELECT ON REPRODUCCIONES TO ROL_ANALISTA;                      -- Analizar datos de reproduccion
GRANT SELECT ON FAVORITOS TO ROL_ANALISTA;                           -- Consultar favoritos para tendencias
GRANT SELECT ON CALIFICACIONES TO ROL_ANALISTA;                      -- Consultar calificaciones y resenas
GRANT SELECT ON REPORTES TO ROL_ANALISTA;                            -- Consultar reportes de moderacion
GRANT SELECT ON REFERIDOS TO ROL_ANALISTA;                           -- Analizar programa de referidos
GRANT SELECT ON FACTURACIONES TO ROL_ANALISTA;                       -- Analizar facturas
GRANT SELECT ON PAGOS TO ROL_ANALISTA;                               -- Analizar pagos y transacciones
GRANT SELECT ON VW_CONTINUAR_VIENDO TO ROL_ANALISTA;                 -- Ver vista de "continue watching"
GRANT SELECT ON VW_REPORTES_PENDIENTES_SOPORTE TO ROL_ANALISTA;      -- Ver reportes pendientes

-- SOPORTE: manejo de reportes, lectura de contexto, sin privilegios de publicacion
-- Puede leer contexto y moderar reportes sin acceso editorial ni financiero.
-- Privilegios minimos: solo lo necesario para atender reporte de usuarios.
GRANT SELECT ON USUARIOS TO ROL_SOPORTE;                             -- Consultar datos de usuario para contexto
GRANT SELECT ON PERFILES TO ROL_SOPORTE;                             -- Consultar perfil del usuario
GRANT SELECT ON CONTENIDOS TO ROL_SOPORTE;                           -- Consultar contenido reportado
GRANT SELECT ON CATEGORIAS TO ROL_SOPORTE;                           -- Consultar categoria del contenido
GRANT SELECT ON REPORTES TO ROL_SOPORTE;                             -- Leer reportes asignados
GRANT INSERT ON REPORTES TO ROL_SOPORTE;                             -- Crear nuevo reporte desde cliente
GRANT UPDATE ON REPORTES TO ROL_SOPORTE;                             -- Cambiar estado de reporte (ABIERTO -> EN_REVISION -> RESUELTO)
GRANT SELECT ON VW_REPORTES_PENDIENTES_SOPORTE TO ROL_SOPORTE;      -- Ver cola de reportes pendientes

-- CONTENIDO: mantenimiento editorial de catalogo
-- Permisos para crear/editar contenidos y su metadata extendida.
-- Puede agregar/modificar contenidos pero no puede cambiar categor ias base ni eliminar.
GRANT SELECT ON CATEGORIAS TO ROL_CONTENIDO;                         -- Consultar categorias disponibles para clasificar
GRANT SELECT, INSERT, UPDATE ON CONTENIDOS TO ROL_CONTENIDO;          -- Crear y editar contenidos (sin DELETE)
GRANT SELECT ON GENEROS TO ROL_CONTENIDO;                            -- Consultar generos para clasificar contenidos
GRANT SELECT, INSERT, UPDATE, DELETE ON CONTENIDOS_GENEROS TO ROL_CONTENIDO;   -- Gestionar generos de un contenido
GRANT SELECT, INSERT, UPDATE, DELETE ON TEMPORADAS TO ROL_CONTENIDO;         -- Crear temporadas de series
GRANT SELECT, INSERT, UPDATE, DELETE ON EPISODIOS TO ROL_CONTENIDO;          -- Crear episodios por temporada
GRANT SELECT, INSERT, UPDATE, DELETE ON CONTENIDOS_RELACIONADOS TO ROL_CONTENIDO; -- Establecer relaciones entre contenidos

-- --------------------------------------------------------------------------
-- Usuarios de base de datos para demostracion NT5
-- --------------------------------------------------------------------------
-- Usuarios tecnicos para pruebas de permisos (no son usuarios de la app).
BEGIN
  EXECUTE IMMEDIATE 'CREATE USER MINFLIX_ADMIN IDENTIFIED BY "Admin123*"';
EXCEPTION
  WHEN OTHERS THEN
    -- ORA-01920: usuario ya existe.
    IF SQLCODE != -1920 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE USER MINFLIX_ANALISTA IDENTIFIED BY "Analista123*"';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1920 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE USER MINFLIX_SOPORTE IDENTIFIED BY "Soporte123*"';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1920 THEN
      RAISE;
    END IF;
END;
/

BEGIN
  EXECUTE IMMEDIATE 'CREATE USER MINFLIX_CONTENIDO IDENTIFIED BY "Contenido123*"';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1920 THEN
      RAISE;
    END IF;
END;
/

ALTER USER MINFLIX_ADMIN PROFILE PRF_MINFLIX_OPERACION;
ALTER USER MINFLIX_ANALISTA PROFILE PRF_MINFLIX_OPERACION;
ALTER USER MINFLIX_SOPORTE PROFILE PRF_MINFLIX_OPERACION;
ALTER USER MINFLIX_CONTENIDO PROFILE PRF_MINFLIX_OPERACION;

-- Permiso basico para iniciar sesion.
GRANT CREATE SESSION TO MINFLIX_ADMIN;
GRANT CREATE SESSION TO MINFLIX_ANALISTA;
GRANT CREATE SESSION TO MINFLIX_SOPORTE;
GRANT CREATE SESSION TO MINFLIX_CONTENIDO;

-- Asignacion de roles a cada usuario tecnico.
GRANT ROL_ADMIN TO MINFLIX_ADMIN;
GRANT ROL_ANALISTA TO MINFLIX_ANALISTA;
GRANT ROL_SOPORTE TO MINFLIX_SOPORTE;
GRANT ROL_CONTENIDO TO MINFLIX_CONTENIDO;

-- --------------------------------------------------------------------------
-- Evidencia sugerida de restriccion de acceso (manual)
-- --------------------------------------------------------------------------
-- 1) CONNECT MINFLIX_ANALISTA/Analista123*;
-- 2) Intentar un INSERT sobre CONTENIDOS y verificar ORA-01031.
-- 3) CONNECT MINFLIX_SOPORTE/Soporte123*;
-- 4) Actualizar REPORTES en estados permitidos y validar exito.
-- 5) CONNECT MINFLIX_CONTENIDO/Contenido123*;
-- 6) Intentar UPDATE en PAGOS y verificar ORA-01031.

COMMIT;
