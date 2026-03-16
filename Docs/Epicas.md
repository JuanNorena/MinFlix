# Épicas del Proyecto MinFlix (Formato INVEST)

Las siguientes Épicas desglosan a alto nivel las necesidades de negocio del sistema MinFlix. Se rigen bajo la metodología **INVEST** (Independent, Negotiable, Valuable, Estimable, Small/Sized appropriately, Testable).

---

## Épica 1: Gestión Central del Catálogo de Contenido Multiformato
**Descripción:** Como empleado de Contenido, quiero poder registrar, estructurar y catalogar el contenido multimedia (películas, series, documentales, música y podcasts), para que la plataforma pueda ofrecer catálogo diverso y bien organizado a sus usuarios.
- **Independent (Independiente):** La gestión de catálogo no depende directamente de los pagos ni de la creación de los clientes. Creada la base, todas las plataformas la consultarán.
- **Negotiable (Negociable):** Los campos adicionales o tipos de categorización (géneros extras) pueden ajustarse, así como el nivel de profundidad de los spin-offs en un inicio.
- **Valuable (Valiosa):** Es el corazón o 'Core' de MinFlix. Sin catálogo estructurado, no hay producto que ofrecer.
- **Estimable (Estimable):** Las restricciones de jerarquía (Serie -> Temporada -> Episodio), películas unitarias, restricciones exclusivas y géneros múltiples son claramente medibles y modelables.
- **Small (Dimensionada correctamente):** La épica se enfoca en el puro almacenamiento del catálogo, dejando reproducciones y búsquedas por fuera. Es lo suficientemente contenida para iterar sobre su modelo relacional.
- **Testable (Comprobable):** Se puede probar verificando que un empleado de contenido tenga flujos válidos de inserción (CRUD de catálogo) y limitando que las películas no admitan temporadas temporalmente.

---

## Épica 2: Suscripciones, Cuentas de Usuario y Gestión de Perfiles
**Descripción:** Como usuario principal del servicio, quiero registrarme, elegir un plan y generar múltiples perfiles bajo una sola cuenta principal, para organizar mis preferencias y permitir el acceso seguro de toda mi familia, incluyendo niños.
- **Independent:** La jerarquía Usuario -> Plan -> Perfiles puede construirse e indexarse sin requerir que los usuarios reproduzcan contenido al instante.
- **Negotiable:** El número final de perfiles por plan o el método matemático de límite pueden reajustarse durante desarrollo según cambios en la oferta comercial.
- **Valuable:** Permite retener audiencias variadas y personalizar los accesos, garantizando el cumplimiento de la ley (restricciones de perfiles infantiles).
- **Estimable:** Cada regla de negocio referida a "N perfiles máximos por plan" tiene una estimación puntual y medible.
- **Small:** Se centra exclusivamente en el ingreso, la selección del plan y el despliegue del árbol familiar de perfiles (sin tocar facturación ni reproducciones cruzadas).
- **Testable:** Evaluada fácilmente forzando la creación de N+1 perfiles para un plan Básico, con el trigger bloqueando la solicitud de inmediato.

---

## Épica 3: Motor de Reproducción de Contenido (Tracking y Analítica Base)
**Descripción:** Como gerente de operaciones, quiero que el sistema rastree minuciosamente el consumo de contenido por cada perfil (fechas, progreso y dispositivo), para alimentar motores de recomendación, reportes gerenciales y reanudaciones de streams.
- **Independent:** Desempeña sus registros apoyándose en Cuentas y Catálogo, pero su lógica de interrupción o tracking opera independiente de facturación o roles de empleados.
- **Negotiable:** La granularidad de los avances porcentuales por dispositivo (e.g. 52% reanudación) se puede abstraer a simples porcentajes redondeados en fases tempranas.
- **Valuable:** Habilita a la gerencia comprender verdaderamente sobre qué contenidos focalizar nuevas compras o promociones y habilita la funcionalidad "seguir viendo".
- **Estimable:** La complejidad viene del gran volumen de registros (200 mín). El esfuerzo en base de datos implica modelado transaccional e indexado para un entorno de alta fragmentación (+ partitioning).
- **Small:** Solo abarca registros operacionales (`REPRODUCCIONES`). Calificación y listas irán en su propia épica de comunidad.
- **Testable:** Probable inyectando reproducción y validando (mediante Trigger) que la reproducción sea frenada si la cuenta carece del flag "ACTIVO".

---

## Épica 4: Integración Comunitaria (Calificaciones, Favoritos y Moderación)
**Descripción:** Como usuario final, quiero calificar contenido, agregarlo a favoritos y alertar irregularidades, para personalizar algoritmos y proteger el ecosistema de contenidos inadecuados; a la vez que soporte necesita revisar dichos reportes.
- **Independent:** La interacción puramente comunitaria no limita la capacidad de reproducir streaming, por lo que es una evolución independiente.
- **Negotiable:** Los estados de revisión o campos de las reseñas se pueden acortar o extender durante la fase de despliegue.
- **Valuable:** Brinda información social de fidelización y métricas C-SAT (Customer Satisfaction) de títulos.
- **Estimable:** Regla vital del +50% progreso visualizado previo a dejar la reseña lo hace muy auditable y con costo fijo en Triggers de validación.
- **Small:** Contenido y reproducciones ya existen para cuando esto comience, agilizando su despliegue y concentrándose puramente en las tablas analíticas ligeras (`FAVORITOS`, `CALIFICACIONES`, `REPORTES`).
- **Testable:** Fácil de atajar ejecutando una prueba unitaria (PL/SQL Trigger) al intentar puntuar una película sin vistas previas asociadas al perfil en acción.

---

## Épica 5: Orquestación Financiera: Facturación, Pagos y Beneficios Sociales
**Descripción:** Como jefe de finanzas, quiero que el sistema aplique la facturación mensual en transacciones seguras, aplicando descuentos por antigüedad y referidos, suspendiendo así mismo cuentas morosas de forma desatendida.
- **Independent:** Construida sobre los usuarios existentes, esta operativa transaccional mensual puede emularse por ventanas cerradas y aislarse de la reproducción.
- **Negotiable:** Si las prioridades cambian, la escala exacta de los descuentos de referidos por antigüedad pueden ajustarse a nuevas reglas comerciales.
- **Valuable:** Es el canal de inyección y saneamiento económico de la corporación y previene el desangre con cortes automáticos.
- **Estimable:** Transacción robusta con `SAVEPOINT`. Tiene el esfuerzo de modelar métodos, status históricos e integrar lógicas transaccionales ACID de base de datos.
- **Small:** Solamente manipula dinero y estados de cuenta mes a mes, un alcance financiero acotado.
- **Testable:** Ejecutando el batch (Stored Procedure / Transacción), comprobando Rollbacks si un pago falla a la mitad y comprobando cierres luego de mora de >30ds vía cursor PL/SQL.

---

## Épica 6: Analítica y Tomas de Decisiones Directivas e Inteligencia Empresarial
**Descripción:** Como plana ejecutiva de MinFlix, requiero consultas pesadas dimensionales paramétricas y vistas materializadas cruzadas de facturación y reproducción; para detectar oportunidades accionables y direccionar el rumbo operacional de la base de datos empresarial.
- **Independent:** No crea lógicas transaccionales; tan solo interroga y pre-calcula los inputs procesados de las otras Épicas. Nula intromisión en el core streaming.
- **Negotiable:** Qué agrupamientos CUBE o PIVOT entregar se pueden recalibrar si finanzas solicita otros criterios pivotales base.
- **Valuable:** Provee conocimiento masivo (Reports analíticos de ingresos y visionados para mercadeo). 
- **Estimable:** Se ciñe a la estricta implementación de Núcleo 1 de la materia (Consultas OLAP, Vistas parametrizadas). 
- **Small:** Aislado en scripts parametrizados de lectura. No interfiere con rutinas almacenadas. 
- **Testable:** Perfectamente medible. Se comprueba comparando si la sumatoria global financiera de la cuenta matricial de CUBE y ROLLUP match con un select * de ingresos totales sin agrupaciones avanzadas.
