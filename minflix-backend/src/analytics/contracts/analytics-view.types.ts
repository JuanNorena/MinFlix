/**
 * Fila de la vista VW_ANALITICA_CONSUMO para el endpoint de consumo de contenido.
 */
export interface ConsumptionRow {
  ciudadResidencia: string;
  categoria: string;
  genero: string | null;
  ultimoDispositivo: string | null;
  plan: string;
  periodoMes: Date;
  totalReproducciones: number;
  perfilesUnicos: number;
  promedioAvance: number;
}

/**
 * Fila de la vista VW_ANALITICA_FINANZAS para el endpoint financiero ejecutivo.
 */
export interface FinanceAnalyticsRow {
  ciudadResidencia: string;
  plan: string;
  periodoAnio: number;
  periodoMes: number;
  totalFacturas: number;
  ingresosTotales: number;
  ingresosCobrados: number;
  ingresosPendientes: number;
  usuariosFacturados: number;
}

/**
 * Fila de la vista VW_ANALITICA_RENDIMIENTO para el endpoint de rendimiento interno.
 */
export interface PerformanceRow {
  departamento: string;
  totalEmpleados: number;
  totalJefes: number;
  empleadosActivos: number;
  anioIngreso: number;
  mesIngreso: number;
}
