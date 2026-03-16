# MinFlix - Plataforma de Streaming Multimedia

MinFlix es un sistema de gestión de bases de datos robusto diseñado para soportar las operaciones integrales de una plataforma de streaming de contenido multimedia. Este proyecto abarca desde el modelado conceptual hasta la implementación avanzada de lógica de negocio y analítica en Oracle Database.

## 👤 Autor
**Juan Sebastian Noreña Espinosa**

---

## 🚀 Descripción del Proyecto
El sistema MinFlix permite la gestión de un catálogo diverso de contenido (películas, series, documentales, música y podcasts), la administración de suscripciones y perfiles de usuario, el seguimiento detallado de reproducciones, y la implementación de un modelo financiero y de fidelización.

### Características Principales:
- **Gestión de Contenido Multiformato:** Estructura jerárquica para series y podcasts (Temporadas -> Episodios) y gestión de contenidos relacionados.
- **Sistema de Suscripciones:** Tres niveles de planes (Básico, Estándar, Premium) con restricciones dinámicas de perfiles y calidad de video.
- **Control de Acceso y Perfiles:** Soporte para perfiles de adultos e infantiles con restricciones de clasificación de contenido.
- **Programa de Referidos y Fidelidad:** Aplicación automática de descuentos basados en el comportamiento y antigüedad del usuario.
- **Analítica Avanzada:** Reportes complejos para la toma de decisiones gerenciales.

---

## 🛠️ Tecnologías Utilizadas
- **Motor de Base de Datos:** Oracle Database
- **Lenguajes:** SQL, PL/SQL
- **Herramientas de Diseño:** Modelo Entidad-Relación (3FN)

---

## 📑 Estructura de Documentación
La documentación detallada se encuentra en la carpeta `Docs/`:
- [Enunciado del Proyecto](./Docs/Enunciado.md): Especificaciones y requerimientos detallados.
- [Épicas del Proyecto](./Docs/Epicas.md): Desglose de necesidades de negocio bajo metodología INVEST.
- [Plan de Desarrollo](./Docs/Plan_Desarrollo.md): Hoja de ruta y fases de implementación.

---

## 📊 Capacidades de Analítica y Reportes
MinFlix está diseñado para proporcionar inteligencia de negocios mediante:
- **Agrupamientos Complejos:** Implementación de `ROLLUP`, `CUBE`, `GROUPING()` y `GROUPING SETS` para análisis de ingresos y consumo.
- **Tablas Cruzadas:** Uso de `PIVOT` y `UNPIVOT` para reportes bidimensionales (ej. Usuarios por Ciudad vs Plan).
- **Vistas Materializadas:** Pre-cálculo de métricas críticas como ratings de contenido e ingresos mensuales para optimizar el rendimiento.
- **Optimización:** Estrategias de indexación avanzada y análisis de planes de ejecución (`EXPLAIN PLAN`).

---

## ⚙️ Guía de Instalación

Para desplegar la base de datos de MinFlix, siga este orden de ejecución de scripts en su entorno Oracle:

1. **Definición de Estructura (DDL):**
   - Ejecute el script de creación de tablas. Este incluye las restricciones de integridad (PK, FK, Check) y los comentarios de tabla/columna.
   - Configure la fragmentación de la tabla `REPRODUCCIONES` según sea necesario.

2. **Carga de Datos (DML):**
   - Inserte los catálogos base (Planes, Categorías, Géneros).
   - Cargue los datos de prueba asimétricos para usuarios, contenidos y transacciones.

3. **Lógica de Negocio (PL/SQL):**
   - Compile las funciones (Cálculo de montos, recomendaciones).
   - Compile los procedimientos almacenados (Registro de usuarios, gestión de planes).
   - Active los triggers de validación y control.

4. **Seguridad:**
   - Ejecute el script de creación de roles (`ROL_ADMIN`, `ROL_ANALISTA`, `ROL_SOPORTE`, `ROL_CONTENIDO`) y asigne los privilegios correspondientes.

5. **Optimización:**
   - Cree los índices recomendados para mejorar el rendimiento de las consultas frecuentes.

---

## 🧩 Épicas de Desarrollo
El proyecto se dividió en 6 épicas fundamentales:
1. **Gestión del Catálogo:** Registro y estructuración de contenido.
2. **Usuarios y Perfiles:** Registro de cuentas y gestión de jerarquías familiares.
3. **Motor de Reproducción:** Tracking y analítica de consumo.
4. **Comunidad:** Calificaciones, favoritos y sistema de moderación.
5. **Orquestación Financiera:** Facturación, pagos y beneficios.
6. **Inteligencia Empresarial:** Consultas pesadas y reportes gerenciales.
