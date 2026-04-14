import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ConsumptionRow,
  FinanceAnalyticsRow,
  PerformanceRow,
} from './contracts/analytics-view.types';
import { AnalyticsConsumptionQueryDto } from './dto/analytics-consumption-query.dto';
import { AnalyticsFinanceQueryDto } from './dto/analytics-finance-query.dto';
import { AnalyticsPerformanceQueryDto } from './dto/analytics-performance-query.dto';

/**
 * Servicio de analitica ejecutiva para consumo, finanzas y rendimiento interno.
 * Consulta directamente las vistas VW_ANALITICA_* creadas en el script NT1.
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Valida que el rol del usuario tenga acceso a los endpoints de analitica.
   * Solo los roles admin y analista pueden consultar estos datos.
   * @param role - Rol extraido del JWT autenticado.
   * @throws ForbiddenException si el rol no esta autorizado.
   */
  private assertAnalyticsRole(role: string): void {
    const normalized = role.toLowerCase();
    if (normalized !== 'admin' && normalized !== 'analista') {
      throw new ForbiddenException(
        'Solo usuarios con rol admin o analista pueden acceder a la analitica ejecutiva',
      );
    }
  }

  /**
   * Convierte un valor Oracle (string, number o null) a numero JavaScript.
   * @param value - Valor raw retornado por el driver de Oracle.
   * @returns Numero parseado o 0 si el valor es nulo.
   */
  private toNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Retorna datos de consumo de contenido desde VW_ANALITICA_CONSUMO.
   * Aplica filtros opcionales de ciudad, categoria, genero, dispositivo y plan.
   * @param role - Rol del usuario autenticado.
   * @param query - Filtros de dimension para el reporte de consumo.
   * @returns Filas de la vista de consumo filtradas y ordenadas.
   */
  async getConsumption(
    role: string,
    query: AnalyticsConsumptionQueryDto,
  ): Promise<ConsumptionRow[]> {
    this.assertAnalyticsRole(role);

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.ciudad) {
      conditions.push(`UPPER(CIUDAD_RESIDENCIA) = UPPER(:${paramIndex})`);
      params.push(query.ciudad);
      paramIndex++;
    }
    if (query.categoria) {
      conditions.push(`UPPER(CATEGORIA) = UPPER(:${paramIndex})`);
      params.push(query.categoria);
      paramIndex++;
    }
    if (query.genero) {
      conditions.push(`UPPER(GENERO) = UPPER(:${paramIndex})`);
      params.push(query.genero);
      paramIndex++;
    }
    if (query.dispositivo) {
      conditions.push(`UPPER(ULTIMO_DISPOSITIVO) = UPPER(:${paramIndex})`);
      params.push(query.dispositivo);
      paramIndex++;
    }
    if (query.plan) {
      conditions.push(`PLAN = :${paramIndex}`);
      params.push(query.plan);
      paramIndex++;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rowLimit = query.limit ?? 200;
    params.push(rowLimit);

    const sql = `
      SELECT *
      FROM (
        SELECT
          CIUDAD_RESIDENCIA     AS "ciudadResidencia",
          CATEGORIA             AS "categoria",
          GENERO                AS "genero",
          ULTIMO_DISPOSITIVO    AS "ultimoDispositivo",
          PLAN                  AS "plan",
          PERIODO_MES           AS "periodoMes",
          TOTAL_REPRODUCCIONES  AS "totalReproducciones",
          PERFILES_UNICOS       AS "perfilesUnicos",
          PROMEDIO_AVANCE       AS "promedioAvance"
        FROM VW_ANALITICA_CONSUMO
        ${where}
        ORDER BY TOTAL_REPRODUCCIONES DESC
      )
      WHERE ROWNUM <= :${paramIndex}
    `;

    const rows = await this.dataSource.query(sql, params);
    return (rows as Record<string, unknown>[]).map((r) => ({
      ciudadResidencia: String(r['ciudadResidencia'] ?? ''),
      categoria: String(r['categoria'] ?? ''),
      genero: r['genero'] != null ? String(r['genero']) : null,
      ultimoDispositivo:
        r['ultimoDispositivo'] != null ? String(r['ultimoDispositivo']) : null,
      plan: String(r['plan'] ?? ''),
      periodoMes: new Date(r['periodoMes'] as string),
      totalReproducciones: this.toNumber(r['totalReproducciones']),
      perfilesUnicos: this.toNumber(r['perfilesUnicos']),
      promedioAvance: this.toNumber(r['promedioAvance']),
    }));
  }

  /**
   * Retorna metricas financieras desde VW_ANALITICA_FINANZAS.
   * Permite segmentar ingresos por ciudad, plan y periodo de facturacion.
   * @param role - Rol del usuario autenticado.
   * @param query - Filtros de ciudad, plan, ano y mes.
   * @returns Filas de la vista financiera filtradas.
   */
  async getFinance(
    role: string,
    query: AnalyticsFinanceQueryDto,
  ): Promise<FinanceAnalyticsRow[]> {
    this.assertAnalyticsRole(role);

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.ciudad) {
      conditions.push(`UPPER(CIUDAD_RESIDENCIA) = UPPER(:${paramIndex})`);
      params.push(query.ciudad);
      paramIndex++;
    }
    if (query.plan) {
      conditions.push(`PLAN = :${paramIndex}`);
      params.push(query.plan);
      paramIndex++;
    }
    if (query.anio !== undefined) {
      conditions.push(`PERIODO_ANIO = :${paramIndex}`);
      params.push(query.anio);
      paramIndex++;
    }
    if (query.mes !== undefined) {
      conditions.push(`PERIODO_MES = :${paramIndex}`);
      params.push(query.mes);
      paramIndex++;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rowLimit = query.limit ?? 200;
    params.push(rowLimit);

    const sql = `
      SELECT *
      FROM (
        SELECT
          CIUDAD_RESIDENCIA     AS "ciudadResidencia",
          PLAN                  AS "plan",
          PERIODO_ANIO          AS "periodoAnio",
          PERIODO_MES           AS "periodoMes",
          TOTAL_FACTURAS        AS "totalFacturas",
          INGRESOS_TOTALES      AS "ingresosTotales",
          INGRESOS_COBRADOS     AS "ingresosCobrados",
          INGRESOS_PENDIENTES   AS "ingresosPendientes",
          USUARIOS_FACTURADOS   AS "usuariosFacturados"
        FROM VW_ANALITICA_FINANZAS
        ${where}
        ORDER BY PERIODO_ANIO DESC, PERIODO_MES DESC, INGRESOS_TOTALES DESC
      )
      WHERE ROWNUM <= :${paramIndex}
    `;

    const rows = await this.dataSource.query(sql, params);
    return (rows as Record<string, unknown>[]).map((r) => ({
      ciudadResidencia: String(r['ciudadResidencia'] ?? ''),
      plan: String(r['plan'] ?? ''),
      periodoAnio: this.toNumber(r['periodoAnio']),
      periodoMes: this.toNumber(r['periodoMes']),
      totalFacturas: this.toNumber(r['totalFacturas']),
      ingresosTotales: this.toNumber(r['ingresosTotales']),
      ingresosCobrados: this.toNumber(r['ingresosCobrados']),
      ingresosPendientes: this.toNumber(r['ingresosPendientes']),
      usuariosFacturados: this.toNumber(r['usuariosFacturados']),
    }));
  }

  /**
   * Retorna metricas de rendimiento interno desde VW_ANALITICA_RENDIMIENTO.
   * Muestra totales de empleados, jefes y activos por departamento y cohort de ingreso.
   * @param role - Rol del usuario autenticado.
   * @param query - Filtros de departamento y ano de ingreso.
   * @returns Filas de la vista de rendimiento filtradas.
   */
  async getInternalPerformance(
    role: string,
    query: AnalyticsPerformanceQueryDto,
  ): Promise<PerformanceRow[]> {
    this.assertAnalyticsRole(role);

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (query.departamento) {
      conditions.push(`UPPER(DEPARTAMENTO) = UPPER(:${paramIndex})`);
      params.push(query.departamento);
      paramIndex++;
    }
    if (query.anio !== undefined) {
      conditions.push(`ANIO_INGRESO = :${paramIndex}`);
      params.push(query.anio);
      paramIndex++;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rowLimit = query.limit ?? 100;
    params.push(rowLimit);

    const sql = `
      SELECT *
      FROM (
        SELECT
          DEPARTAMENTO       AS "departamento",
          TOTAL_EMPLEADOS    AS "totalEmpleados",
          TOTAL_JEFES        AS "totalJefes",
          EMPLEADOS_ACTIVOS  AS "empleadosActivos",
          ANIO_INGRESO       AS "anioIngreso",
          MES_INGRESO        AS "mesIngreso"
        FROM VW_ANALITICA_RENDIMIENTO
        ${where}
        ORDER BY DEPARTAMENTO, ANIO_INGRESO DESC, MES_INGRESO DESC
      )
      WHERE ROWNUM <= :${paramIndex}
    `;

    const rows = await this.dataSource.query(sql, params);
    return (rows as Record<string, unknown>[]).map((r) => ({
      departamento: String(r['departamento'] ?? ''),
      totalEmpleados: this.toNumber(r['totalEmpleados']),
      totalJefes: this.toNumber(r['totalJefes']),
      empleadosActivos: this.toNumber(r['empleadosActivos']),
      anioIngreso: this.toNumber(r['anioIngreso']),
      mesIngreso: this.toNumber(r['mesIngreso']),
    }));
  }
}
