import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * Módulo de analítica ejecutiva para reportes OLAP de negocio.
 *
 * Este módulo implementa el sistema de Business Intelligence (BI) de MinFlix,
 * exponiendo dashboards ejecutivos para roles admin y analista. Consulta
 * vistas materializadas de Oracle diseñadas específicamente para análisis
 * multidimensional (OLAP).
 *
 * @remarks
 * **Arquitectura especial:**
 * - NO usa TypeORM Repository pattern
 * - Consulta vistas Oracle directamente vía `DataSource.query()`
 * - Las vistas son pre-calculadas por Oracle para máximo rendimiento
 * - Implementa filtros dinámicos de dimensiones OLAP
 *
 * **Vistas Oracle consultadas:**
 * - `VW_ANALITICA_CONSUMO`: Consumo de contenido agregado por dimensiones
 * - `VW_ANALITICA_FINANZAS`: Métricas financieras e ingresos
 * - `VW_ANALITICA_RENDIMIENTO`: Métricas internas del equipo
 *
 * **Funcionalidades principales:**
 *
 * **1. Analítica de Consumo:**
 * - Total de reproducciones por ciudad, categoría, género, dispositivo, plan
 * - Perfiles únicos que consumieron contenido
 * - Promedio de avance de reproducción (engagement)
 * - Agregación mensual para análisis de tendencias
 *
 * **2. Analítica Financiera:**
 * - Ingresos totales, cobrados y pendientes por periodo
 * - Segmentación por ciudad de residencia y plan
 * - Total de facturas generadas
 * - Usuarios facturados únicos
 * - Análisis de conversión de pago
 *
 * **3. Analítica de Rendimiento Interno:**
 * - Total de empleados por departamento
 * - Empleados activos vs inactivos
 * - Jefes por departamento
 * - Cohortes de ingreso (año y mes)
 * - Análisis de estructura organizacional
 *
 * **Control de acceso:**
 * - Solo roles `admin` y `analista` pueden consultar analítica
 * - Validación de rol en cada endpoint del servicio
 * - HTTP 403 Forbidden si el rol no está autorizado
 *
 * **Endpoints expuestos:**
 * - `GET /api/v1/analytics/consumption` - Dashboard de consumo (admin/analista)
 * - `GET /api/v1/analytics/finance` - Dashboard financiero (admin/analista)
 * - `GET /api/v1/analytics/performance` - Dashboard interno (admin/analista)
 *
 * **Filtros OLAP disponibles:**
 *
 * *Consumo:*
 * - ciudad, categoria, genero, dispositivo, plan, limit
 *
 * *Finanzas:*
 * - ciudad, plan, anio, mes, limit
 *
 * *Rendimiento:*
 * - departamento, anio, limit
 *
 * @example
 * ```typescript
 * // Importar en otro módulo
 * @Module({
 *   imports: [AnalyticsModule],
 * })
 * export class OtroModule {}
 * ```
 *
 * @see {@link AnalyticsService} para la lógica de consultas OLAP
 * @see {@link AnalyticsController} para los endpoints REST expuestos
 */
@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
