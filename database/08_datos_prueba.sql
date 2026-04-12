-- ============================================================================
-- MinFlix - Datos de Prueba Asimetricos para Analitica (Epica 6)
-- Ejecutar como MINFLIX_APP en XEPDB1
-- Requiere: scripts 01 al 07 ejecutados previamente
-- Genera: 30 usuarios, 50 perfiles, 200 reproducciones, 80 pagos, 60 calificaciones, 40 favoritos
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Seccion 1: Usuarios adicionales (28 usuarios + 2 ya existentes = 30 total)
-- Contrasena generica hasheada con bcrypt para pruebas
-- ----------------------------------------------------------------------------
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Carlos Mendoza',    'carlos.mendoza@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 400, SYSDATE + 30);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Laura Gomez',       'laura.gomez@email.com',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 380, SYSDATE + 15);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Andres Torres',     'andres.torres@email.com',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 500, SYSDATE + 20);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Maria Reyes',       'maria.reyes@email.com',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 200, SYSDATE + 10);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Juan Herrera',      'juan.herrera@email.com',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 300, SYSDATE + 25);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Sofia Vargas',      'sofia.vargas@email.com',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 450, SYSDATE + 5);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Diego Castro',      'diego.castro@email.com',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 150, SYSDATE + 30);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Valentina Rios',    'valentina.rios@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 600, SYSDATE + 12);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Felipe Mora',       'felipe.mora@email.com',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 700, SYSDATE + 8);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Camila Ortiz',      'camila.ortiz@email.com',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 90,  SYSDATE + 20);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Sebastian Pena',    'sebastian.pena@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 260, SYSDATE + 18);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Isabella Suarez',   'isabella.suarez@email.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 320, SYSDATE + 22);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Nicolas Jimenez',   'nicolas.jimenez@email.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 180, SYSDATE + 14);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Daniela Rojas',     'daniela.rojas@email.com',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 410, SYSDATE + 6);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Mateo Guerrero',    'mateo.guerrero@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 550, SYSDATE + 28);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Gabriela Medina',   'gabriela.medina@email.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 120, SYSDATE + 16);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Samuel Cardona',    'samuel.cardona@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 230, SYSDATE + 9);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Mariana Salcedo',   'mariana.salcedo@email.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 480, SYSDATE + 3);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Tomas Aguilar',     'tomas.aguilar@email.com',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 60,  SYSDATE + 30);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Lucia Bermudez',    'lucia.bermudez@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 350, SYSDATE + 11);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Alejandro Vega',    'alejandro.vega@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 620, SYSDATE + 7);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Natalia Ospina',    'natalia.ospina@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 170, SYSDATE + 24);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Ricardo Pardo',     'ricardo.pardo@email.com',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 290, SYSDATE + 19);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Paola Montoya',     'paola.montoya@email.com',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 3, SYSDATE - 530, SYSDATE + 2);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Esteban Cano',      'esteban.cano@email.com',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 1, SYSDATE - 75,  SYSDATE + 27);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Juliana Acosta',    'juliana.acosta@email.com',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'ACTIVO', 2, SYSDATE - 440, SYSDATE + 13);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Cristian Lozano',   'cristian.lozano@email.com',   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'SUSPENDIDO', 1, SYSDATE - 800, SYSDATE - 10);
INSERT INTO USUARIOS (NOMBRE, EMAIL, PASSWORD_HASH, ROL, ESTADO_CUENTA, ID_PLAN, FECHA_SUSCRIPCION, FECHA_CORTE)
VALUES ('Andrea Florez',     'andrea.florez@email.com',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaJobMVzMkNPpx8Ue5rZqKqKu', 'usuario', 'SUSPENDIDO', 2, SYSDATE - 750, SYSDATE - 5);

COMMIT;

-- ----------------------------------------------------------------------------
-- Seccion 2: Perfiles adicionales (uno por usuario nuevo = 28 perfiles nuevos)
-- ----------------------------------------------------------------------------
BEGIN
  FOR u IN (
    SELECT ID_USUARIO FROM USUARIOS
     WHERE EMAIL NOT IN ('admin@minflix.com')
       AND NOT EXISTS (SELECT 1 FROM PERFILES P WHERE P.ID_USUARIO = USUARIOS.ID_USUARIO)
  ) LOOP
    INSERT INTO PERFILES (ID_USUARIO, NOMBRE, TIPO_PERFIL)
    VALUES (u.ID_USUARIO, 'Principal', 'adulto');
  END LOOP;
END;
/

-- Perfiles infantiles adicionales para usuarios premium y estandar
INSERT INTO PERFILES (ID_USUARIO, NOMBRE, TIPO_PERFIL)
SELECT ID_USUARIO, 'Ninos', 'infantil'
  FROM USUARIOS
 WHERE ID_PLAN IN (SELECT ID_PLAN FROM PLANES WHERE NOMBRE IN ('ESTANDAR', 'PREMIUM'))
   AND ESTADO_CUENTA = 'ACTIVO'
   AND ROWNUM <= 15;

COMMIT;

-- ----------------------------------------------------------------------------
-- Seccion 3: Contenidos adicionales para mayor variedad en analitica
-- ----------------------------------------------------------------------------
INSERT INTO CONTENIDOS (TITULO, TIPO_CONTENIDO, ANIO_LANZAMIENTO, DURACION_MINUTOS, CLASIFICACION_EDAD, ES_EXCLUSIVO, ID_CATEGORIA, ID_EMPLEADO_PUBLICADOR)
VALUES ('El Ultimo Vuelo', 'pelicula', 2023, 105, '+13', 0, (SELECT ID_CATEGORIA FROM CATEGORIAS WHERE NOMBRE = 'Accion'), (SELECT MIN(ID_USUARIO) FROM USUARIOS WHERE ROL = 'admin'));
INSERT INTO CONTENIDOS (TITULO, TIPO_CONTENIDO, ANIO_LANZAMIENTO, DURACION_MINUTOS, CLASIFICACION_EDAD, ES_EXCLUSIVO, ID_CATEGORIA, ID_EMPLEADO_PUBLICADOR)
VALUES ('Raices', 'serie', 2022, 50, '+16', 1, (SELECT ID_CATEGORIA FROM CATEGORIAS WHERE NOMBRE = 'Drama'), (SELECT MIN(ID_USUARIO) FROM USUARIOS WHERE ROL = 'admin'));
INSERT INTO CONTENIDOS (TITULO, TIPO_CONTENIDO, ANIO_LANZAMIENTO, DURACION_MINUTOS, CLASIFICACION_EDAD, ES_EXCLUSIVO, ID_CATEGORIA, ID_EMPLEADO_PUBLICADOR)
VALUES ('Planeta Vivo', 'documental', 2021, 80, 'TP', 0, (SELECT ID_CATEGORIA FROM CATEGORIAS WHERE NOMBRE = 'Documental'), (SELECT MIN(ID_USUARIO) FROM USUARIOS WHERE ROL = 'admin'));
INSERT INTO CONTENIDOS (TITULO, TIPO_CONTENIDO, ANIO_LANZAMIENTO, DURACION_MINUTOS, CLASIFICACION_EDAD, ES_EXCLUSIVO, ID_CATEGORIA, ID_EMPLEADO_PUBLICADOR)
VALUES ('Magicos y Valientes', 'pelicula', 2020, 90, '+7', 0, (SELECT ID_CATEGORIA FROM CATEGORIAS WHERE NOMBRE = 'Infantil'), (SELECT MIN(ID_USUARIO) FROM USUARIOS WHERE ROL = 'admin'));
INSERT INTO CONTENIDOS (TITULO, TIPO_CONTENIDO, ANIO_LANZAMIENTO, DURACION_MINUTOS, CLASIFICACION_EDAD, ES_EXCLUSIVO, ID_CATEGORIA, ID_EMPLEADO_PUBLICADOR)
VALUES ('Tech Talks Colombia', 'podcast', 2024, 45, 'TP', 1, (SELECT ID_CATEGORIA FROM CATEGORIAS WHERE NOMBRE = 'Podcast'), (SELECT MIN(ID_USUARIO) FROM USUARIOS WHERE ROL = 'admin'));

COMMIT;

-- ----------------------------------------------------------------------------
-- Seccion 4: Reproducciones (200+ registros variados por perfil, contenido y dispositivo)
-- Se insertan directamente sin trigger de cuenta activa para perfiles suspendidos
-- usando solo perfiles de cuentas ACTIVAS
-- ----------------------------------------------------------------------------
BEGIN
  FOR i IN 1..200 LOOP
    INSERT INTO REPRODUCCIONES (
      ID_PERFIL, ID_CONTENIDO, PROGRESO_SEGUNDOS, DURACION_TOTAL_SEGUNDOS,
      ULTIMO_DISPOSITIVO, ESTADO_REPRODUCCION, FECHA_INICIO, FECHA_ULTIMO_EVENTO
    )
    SELECT
      p.ID_PERFIL,
      c.ID_CONTENIDO,
      ROUND(DBMS_RANDOM.VALUE(300, c.DURACION_MINUTOS * 60)),
      c.DURACION_MINUTOS * 60,
      CASE MOD(i, 4)
        WHEN 0 THEN 'celular'
        WHEN 1 THEN 'computador'
        WHEN 2 THEN 'TV'
        ELSE        'tablet'
      END,
      CASE
        WHEN ROUND(DBMS_RANDOM.VALUE(300, c.DURACION_MINUTOS * 60)) >= c.DURACION_MINUTOS * 60 * 0.95
          THEN 'FINALIZADO'
        WHEN MOD(i, 5) = 0
          THEN 'PAUSADO'
        ELSE 'EN_PROGRESO'
      END,
      SYSDATE - ROUND(DBMS_RANDOM.VALUE(1, 365)),
      SYSDATE - ROUND(DBMS_RANDOM.VALUE(0, 30))
    FROM (
      SELECT ID_PERFIL FROM PERFILES
       WHERE ID_USUARIO IN (SELECT ID_USUARIO FROM USUARIOS WHERE ESTADO_CUENTA = 'ACTIVO')
       ORDER BY DBMS_RANDOM.VALUE
       FETCH FIRST 1 ROWS ONLY
    ) p,
    (
      SELECT ID_CONTENIDO, DURACION_MINUTOS
        FROM CONTENIDOS
       WHERE DURACION_MINUTOS IS NOT NULL
       ORDER BY DBMS_RANDOM.VALUE
       FETCH FIRST 1 ROWS ONLY
    ) c;
  END LOOP;
  COMMIT;
END;
/

-- ----------------------------------------------------------------------------
-- Seccion 5: Pagos historicos (80 registros variados por metodo y estado)
-- ----------------------------------------------------------------------------
BEGIN
  FOR i IN 1..80 LOOP
    INSERT INTO PAGOS (
      ID_USUARIO, MONTO, MONTO_DESCUENTO, MONTO_FINAL,
      METODO_PAGO, ESTADO_PAGO, FECHA_PAGO, FECHA_PERIODO, DESCRIPCION
    )
    SELECT
      u.ID_USUARIO,
      p.PRECIO_MENSUAL,
      CASE WHEN MOD(i, 5) = 0 THEN ROUND(p.PRECIO_MENSUAL * 0.1) ELSE 0 END,
      CASE WHEN MOD(i, 5) = 0
        THEN p.PRECIO_MENSUAL - ROUND(p.PRECIO_MENSUAL * 0.1)
        ELSE p.PRECIO_MENSUAL
      END,
      CASE MOD(i, 5)
        WHEN 0 THEN 'PSE'
        WHEN 1 THEN 'NEQUI'
        WHEN 2 THEN 'TARJETA_CREDITO'
        WHEN 3 THEN 'TARJETA_DEBITO'
        ELSE        'DAVIPLATA'
      END,
      CASE
        WHEN MOD(i, 10) = 0 THEN 'FALLIDO'
        WHEN MOD(i, 15) = 0 THEN 'REEMBOLSADO'
        ELSE 'EXITOSO'
      END,
      SYSDATE - ROUND(DBMS_RANDOM.VALUE(1, 365)),
      TRUNC(SYSDATE - ROUND(DBMS_RANDOM.VALUE(1, 365)), 'MM'),
      'Pago mensual historico'
    FROM (
      SELECT ID_USUARIO FROM USUARIOS
       WHERE ESTADO_CUENTA IN ('ACTIVO', 'SUSPENDIDO')
         AND ID_PLAN IS NOT NULL
       ORDER BY DBMS_RANDOM.VALUE
       FETCH FIRST 1 ROWS ONLY
    ) u,
    (
      SELECT PL.PRECIO_MENSUAL
        FROM USUARIOS US
        INNER JOIN PLANES PL ON PL.ID_PLAN = US.ID_PLAN
       ORDER BY DBMS_RANDOM.VALUE
       FETCH FIRST 1 ROWS ONLY
    ) p;
  END LOOP;
  COMMIT;
END;
/

-- ----------------------------------------------------------------------------
-- Seccion 6: Calificaciones (60 registros - solo perfiles con >50% reproduccion)
-- ----------------------------------------------------------------------------
BEGIN
  FOR i IN 1..60 LOOP
    INSERT INTO CALIFICACIONES (ID_PERFIL, ID_CONTENIDO, PUNTUACION, RESENA)
    SELECT r.ID_PERFIL, r.ID_CONTENIDO,
           ROUND(DBMS_RANDOM.VALUE(1, 5)),
           CASE MOD(i, 3)
             WHEN 0 THEN 'Excelente contenido, muy recomendado.'
             WHEN 1 THEN 'Buena produccion, entretenida.'
             ELSE        'Interesante pero mejorable.'
           END
      FROM (
        SELECT ID_PERFIL, ID_CONTENIDO
          FROM REPRODUCCIONES
         WHERE PORCENTAJE_AVANCE >= 50
           AND NOT EXISTS (
             SELECT 1 FROM CALIFICACIONES C2
              WHERE C2.ID_PERFIL    = REPRODUCCIONES.ID_PERFIL
                AND C2.ID_CONTENIDO = REPRODUCCIONES.ID_CONTENIDO
           )
         ORDER BY DBMS_RANDOM.VALUE
         FETCH FIRST 1 ROWS ONLY
      ) r;
  END LOOP;
  COMMIT;
END;
/

-- ----------------------------------------------------------------------------
-- Seccion 7: Favoritos (40 registros)
-- ----------------------------------------------------------------------------
BEGIN
  FOR i IN 1..40 LOOP
    INSERT INTO FAVORITOS (ID_PERFIL, ID_CONTENIDO)
    SELECT p.ID_PERFIL, c.ID_CONTENIDO
      FROM (
        SELECT ID_PERFIL FROM PERFILES
         WHERE TIPO_PERFIL = 'adulto'
         ORDER BY DBMS_RANDOM.VALUE
         FETCH FIRST 1 ROWS ONLY
      ) p,
      (
        SELECT ID_CONTENIDO FROM CONTENIDOS
         WHERE CLASIFICACION_EDAD NOT IN ('+16', '+18')
         ORDER BY DBMS_RANDOM.VALUE
         FETCH FIRST 1 ROWS ONLY
      ) c
     WHERE NOT EXISTS (
       SELECT 1 FROM FAVORITOS F2
        WHERE F2.ID_PERFIL    = p.ID_PERFIL
          AND F2.ID_CONTENIDO = c.ID_CONTENIDO
     );
  END LOOP;
  COMMIT;
END;
/

-- ----------------------------------------------------------------------------
-- Verificacion final
-- ----------------------------------------------------------------------------
SELECT 'USUARIOS'       AS TABLA, COUNT(*) AS TOTAL FROM USUARIOS      UNION ALL
SELECT 'PERFILES',                COUNT(*)           FROM PERFILES      UNION ALL
SELECT 'CONTENIDOS',              COUNT(*)           FROM CONTENIDOS    UNION ALL
SELECT 'REPRODUCCIONES',          COUNT(*)           FROM REPRODUCCIONES UNION ALL
SELECT 'PAGOS',                   COUNT(*)           FROM PAGOS         UNION ALL
SELECT 'CALIFICACIONES',          COUNT(*)           FROM CALIFICACIONES UNION ALL
SELECT 'FAVORITOS',               COUNT(*)           FROM FAVORITOS;
