# Epicas INVEST de MinFlix (Alineacion Detallada con Enunciado)

Fecha de corte: 2026-04-13

## 1. Criterio de lectura
1. Este documento usa el enunciado como fuente primaria y baja cada bloque a epicas ejecutables.
2. Cada epica se describe con INVEST y con trazabilidad exacta a Oracle, backend y frontend.
3. Estado por epica:
   - Pendiente: sin cobertura funcional usable.
   - Parcial: cobertura incompleta o sin evidencia en alguna capa.
   - Avanzado: cobertura funcional con brechas menores.
   - Completo: evidencia de cierre en SQL + API + UI + pruebas.

## 2. Alineacion paso a paso del enunciado

### 2.1 Bloque 1.1 - Gestion de contenido
1. Requisito: tipos de contenido, clasificacion por edad, generos M:N, temporadas/episodios, contenidos relacionados.
2. Epica asociada principal: Epica 1 (Catalogo).
3. Estado actual:
   - Oracle: Avanzado (scripts 02 y 07).
   - Backend: Parcial (catalogo base, falta exponer metadatos extendidos de 07).
   - Frontend: Parcial (detalle sin cobertura completa de temporadas/episodios/relaciones).

### 2.2 Bloque 1.2 - Gestion de usuarios y cuentas
1. Requisito: nombre, email, telefono, fecha de nacimiento, ciudad, plan y perfiles.
2. Epica asociada principal: Epica 2 (Cuentas, planes y perfiles).
3. Hallazgo clave corregido en esta iteracion:
   - Brecha previa: telefono, fecha de nacimiento y ciudad no estaban modelados end-to-end.
   - Alineacion aplicada: columnas en USUARIOS, seed por rol con esos datos, DTO y formulario de registro actualizados.

### 2.3 Bloque 1.3 - Reproduccion e interaccion
1. Requisito: historial por perfil con dispositivo y porcentaje; favoritos, ratings y reportes.
2. Epicas asociadas: Epica 3 (Reproduccion) y Epica 4 (Comunidad).
3. Estado actual:
   - Reproduccion: Avanzado.
   - Comunidad/moderacion: Avanzado.
   - Brecha principal: episodio exacto en series/podcasts para trazabilidad fina.

### 2.4 Bloque 1.4 - Organizacion del equipo
1. Requisito: departamentos, jerarquia supervisor-subordinado, publicador de contenido, moderador de reportes.
2. Epica asociada principal: Epica 6 (Reporteria/operacion interna) y soporte de Epica 1 y 4.
3. Estado actual: Parcial (modelo Oracle existe, falta exposicion API/UI de consulta operacional).

### 2.5 Bloque 1.5 - Pagos y facturacion
1. Requisito del dominio academico: modelar ciclo financiero, estados y descuentos.
2. Decision funcional de proyecto (alineada a tu instruccion):
   - No se conecta ninguna pasarela de pagos real.
   - El usuario ingresa datos de tarjeta en UI.
   - Al hacer clic en pagar, la compra se marca exitosa de forma simulada.
   - Se registra transaccion de prueba y se actualiza factura/cuenta.
3. Epica asociada principal: Epica 5 (Finanzas).

### 2.6 Bloque 1.6 - Reportes y analitica
1. Requisito: consumo, finanzas por ciudad/plan y productividad interna.
2. Epica asociada principal: Epica 6 (Analitica y reporteria ejecutiva).
3. Estado actual: Pendiente parcial (falta paquete NT1 final y dashboard).

## 3. Epica 1 - Catalogo multiformato

### 3.1 INVEST
1. Independent: evoluciona sin depender de pagos.
2. Negotiable: taxonomia y metadatos extendibles.
3. Valuable: base de valor de la plataforma.
4. Estimable: entidades y reglas acotadas.
5. Small: concentrada en dominio editorial.
6. Testable: validable por consultas y navegacion de catalogo.

### 3.2 Cobertura esperada del enunciado
1. Tipos: pelicula, serie, documental, musica, podcast.
2. Generos M:N.
3. Temporadas y episodios en series/podcasts.
4. Relaciones entre contenidos (secuela/precuela/remake/spin-off).

### 3.3 Estado por capa
1. Oracle: Avanzado.
2. Backend: Parcial.
3. Frontend: Parcial.

### 3.4 Cierre de epica
1. Endpoints para generos, temporadas, episodios y relacionados.
2. Vista de detalle con esos metadatos.
3. Evidencia de validaciones de clasificacion por perfil.

## 4. Epica 2 - Cuentas, planes y perfiles

### 4.1 INVEST
1. Independent: puede cerrarse sin analitica final.
2. Negotiable: limites/comportamientos ajustables por plan.
3. Valuable: habilita personalizacion familiar.
4. Estimable: reglas de ownership y limite son claras.
5. Small: foco en registro y perfiles.
6. Testable: validable con plan + restriccion infantil.

### 4.2 Cobertura esperada del enunciado
1. Datos personales completos de registro.
2. Plan de suscripcion y limite de perfiles.
3. Perfil infantil con restricciones.
4. Base para referidos.

### 4.3 Estado por capa
1. Oracle: Avanzado.
2. Backend: Avanzado.
3. Frontend: Avanzado.
4. Brecha cerrada hoy: telefono, fecha de nacimiento y ciudad en todo el flujo.

### 4.4 Cierre de epica
1. Registro obligatorio con nombre, email, telefono, fechaNacimiento, ciudadResidencia, plan y perfil inicial.
2. Seed de usuarios con datos personales para todos los roles.
3. Evidencia de validaciones en API y DB.

## 5. Epica 3 - Reproduccion y continuidad

### 5.1 INVEST
1. Independent: no requiere pasarela de pagos real.
2. Negotiable: granularidad de eventos escalable.
3. Valuable: habilita continuar viendo e historial.
4. Estimable: eventos y filtros acotados.
5. Small: centrada en tracking por perfil.
6. Testable: verificable por progreso y ownership.

### 5.2 Estado por capa
1. Oracle: Avanzado.
2. Backend: Avanzado.
3. Frontend: Avanzado.
4. Brecha: episodio exacto en series/podcasts.

## 6. Epica 4 - Comunidad y moderacion

### 6.1 INVEST
1. Independent: no bloquea reproduccion.
2. Negotiable: motivos y estados ampliables.
3. Valuable: mejora calidad de catalogo.
4. Estimable: favoritos/ratings/reportes delimitados.
5. Small: flujo social y de soporte.
6. Testable: reglas de +50% y control por rol.

### 6.2 Estado por capa
1. Oracle: Avanzado.
2. Backend: Avanzado.
3. Frontend: Avanzado.
4. Mejora transversal incluida: consistencia de menu hamburguesa en vistas internas.

## 7. Epica 5 - Finanzas y facturacion simulada

### 7.1 INVEST
1. Independent: opera sobre usuarios y planes ya existentes.
2. Negotiable: descuentos y reglas de negocio pueden ajustarse.
3. Valuable: cierra ciclo de estado de cuenta.
4. Estimable: entidades financieras y estados definidos.
5. Small: ciclo de facturacion/pago/referidos.
6. Testable: calculo de montos y transicion de estados.

### 7.2 Regla funcional acordada para pagos
1. El sistema NO recauda dinero real.
2. Se solicita informacion completa de tarjeta para UX realista.
3. El checkout siempre termina en EXITO simulado.
4. No hay integracion con pasarela externa.

### 7.3 Estado por capa
1. Oracle: Avanzado (09, 14, 15 y 16).
2. Backend: Avanzado (summary/invoices/payments/referrals + checkout simulado).
3. Frontend: Avanzado (BillingPage con formulario de tarjeta y pago simulado).

### 7.4 Cierre de epica
1. POST de checkout simulado disponible y documentado.
2. Registro de pago de prueba y actualizacion de factura.
3. Mensaje explicito en UI/API de no cobro real.
4. Seed con al menos una factura pendiente para probar checkout.

## 8. Epica 6 - Reporteria ejecutiva y analitica

### 8.1 INVEST
1. Independent: solo lectura y consolidacion.
2. Negotiable: dimensiones analiticas ajustables.
3. Valuable: soporte a decisiones.
4. Estimable: NT1 define volumen y tecnica.
5. Small: enfoca lectura agregada.
6. Testable: consistencia de agregados y planes de ejecucion.

### 8.2 Estado por capa
1. Oracle: Pendiente parcial.
2. Backend: Pendiente.
3. Frontend: Pendiente.

### 8.3 Cierre de epica
1. Script NT1 completo y validado.
2. Endpoints analiticos por ciudad/categoria/genero/dispositivo/plan/tiempo.
3. Dashboard para rol analista/admin.

## 9. Matriz de trazabilidad epica -> artefactos

| Epica | SQL | Backend | Frontend | Estado |
| --- | --- | --- | --- | --- |
| 1 | 02, 07 | catalog | browse + detail | Parcial |
| 2 | 01, 03, 13, 16 | auth | login/register/profiles | Avanzado |
| 3 | 04 | playback | browse continuidad/historial | Avanzado |
| 4 | 05, 06, 08 | community | detail + moderation | Avanzado |
| 5 | 09, 14, 15 | finance | billing + checkout simulado | Avanzado |
| 6 | NT1 pendiente | pendiente | pendiente | Pendiente |

## 10. Requisito transversal de UX
1. El menu hamburguesa debe comportarse igual en vistas internas con topbar.
2. Vistas alineadas: browse, content detail, moderacion, billing.
3. En movil:
   - acciones ocultas por defecto,
   - apertura con boton menu,
   - cierre al navegar o cerrar sesion.

## 11. Requisito transversal de seeds
1. Los seeds deben permitir demostrar flujos reales de sustentacion.
2. Minimo para cierre actual:
   - usuarios seed con telefono, fechaNacimiento y ciudad,
   - facturas seed con al menos un caso pendiente,
   - pagos seed historicos de referencia,
   - referidos seed validados para descuento.
