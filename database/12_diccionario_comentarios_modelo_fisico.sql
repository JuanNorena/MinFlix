-- ============================================================================
-- MinFlix - Complemento de Modelo Fisico (COMMENT ON TABLE/COLUMN)
-- Ejecutar como owner de tablas (SYSTEM en entorno actual).
-- Requiere: scripts 01..11 aplicados
-- ============================================================================

COMMENT ON TABLE PLANES IS 'Catalogo de planes de suscripcion con limites de perfiles y precio mensual.';
COMMENT ON TABLE USUARIOS IS 'Cuentas principales de acceso de la plataforma MinFlix.';
COMMENT ON TABLE PERFILES IS 'Perfiles de reproduccion dependientes de una cuenta principal.';
COMMENT ON TABLE CATEGORIAS IS 'Clasificacion primaria del contenido multimedia.';
COMMENT ON TABLE CONTENIDOS IS 'Catalogo multimedia principal (peliculas, series, documentales, musica, podcasts).';
COMMENT ON TABLE GENEROS IS 'Taxonomia transversal de genero para contenidos.';
COMMENT ON TABLE CONTENIDOS_GENEROS IS 'Relacion N:M entre contenidos y generos.';
COMMENT ON TABLE TEMPORADAS IS 'Agrupador estructural por temporadas para series y podcasts.';
COMMENT ON TABLE EPISODIOS IS 'Unidades episodicas asociadas a una temporada.';
COMMENT ON TABLE CONTENIDOS_RELACIONADOS IS 'Relacion semantica entre contenidos (secuela, remake, spin-off, etc.).';
COMMENT ON TABLE REPRODUCCIONES IS 'Registro de sesiones de consumo por perfil y contenido.';
COMMENT ON TABLE FAVORITOS IS 'Lista personal de contenido marcado como favorito por perfil.';
COMMENT ON TABLE CALIFICACIONES IS 'Valoracion de 1 a 5 y resena opcional por perfil y contenido.';
COMMENT ON TABLE REPORTES IS 'Reportes de contenido inapropiado y su ciclo de moderacion.';
COMMENT ON TABLE REFERIDOS IS 'Relacion de usuario referente y usuario referido para beneficios.';
COMMENT ON TABLE FACTURACIONES IS 'Ciclos de facturacion mensual por usuario con descuentos aplicables.';
COMMENT ON TABLE PAGOS IS 'Transacciones de pago asociadas a facturaciones.';
COMMENT ON TABLE DEPARTAMENTOS IS 'Estructura organizacional interna de MinFlix.';
COMMENT ON TABLE EMPLEADOS IS 'Plantilla de empleados y jerarquia supervisor-subordinado.';

COMMENT ON COLUMN USUARIOS.ROL IS 'Rol funcional de cuenta: admin, soporte, contenido, analista, usuario.';
COMMENT ON COLUMN USUARIOS.ESTADO_CUENTA IS 'Estado operativo para control de acceso y reproduccion.';
COMMENT ON COLUMN USUARIOS.TELEFONO IS 'Telefono de contacto del titular de cuenta para soporte y recuperacion.';
COMMENT ON COLUMN USUARIOS.FECHA_NACIMIENTO IS 'Fecha de nacimiento del titular para validaciones de negocio y segmentacion.';
COMMENT ON COLUMN USUARIOS.CIUDAD_RESIDENCIA IS 'Ciudad de residencia para analitica de consumo e ingresos por territorio.';
COMMENT ON COLUMN PERFILES.TIPO_PERFIL IS 'Tipo de perfil: adulto o infantil.';
COMMENT ON COLUMN CONTENIDOS.TIPO_CONTENIDO IS 'Tipo principal de contenido multimedia.';
COMMENT ON COLUMN CONTENIDOS.CLASIFICACION_EDAD IS 'Clasificacion de control parental (TP, +7, +13, +16, +18).';
COMMENT ON COLUMN CONTENIDOS.ID_EMPLEADO_PUBLICADOR IS 'Usuario responsable de publicacion editorial del contenido.';
COMMENT ON COLUMN REPRODUCCIONES.PORCENTAJE_AVANCE IS 'Avance calculado de consumo para continuar viendo y elegibilidad de calificacion.';
COMMENT ON COLUMN CALIFICACIONES.PUNTAJE IS 'Valoracion del contenido en escala de 1 a 5.';
COMMENT ON COLUMN REPORTES.ESTADO_REPORTE IS 'Estado de ciclo de vida del reporte de moderacion.';
COMMENT ON COLUMN FACTURACIONES.MONTO_FINAL IS 'Monto final luego de aplicar descuentos de referidos y fidelidad.';
COMMENT ON COLUMN PAGOS.ESTADO_TRANSACCION IS 'Estado transaccional del pago (exitoso, fallido, pendiente, reembolsado).';
COMMENT ON COLUMN EMPLEADOS.ID_SUPERVISOR IS 'Empleado supervisor directo dentro del mismo departamento.';

COMMIT;
