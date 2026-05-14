// --------------------------------------------------------------------------
// Importaciones de NestJS y TypeORM
// --------------------------------------------------------------------------

/** Excepción e inyección de NestJS */
import { ForbiddenException, Injectable } from '@nestjs/common';

/** Conexión directa a la base de datos de TypeORM para consultas nativas */
import { DataSource } from 'typeorm';

/**
 * Servicio de demostración académica para los núcleos temáticos NT1..NT4.
 * Ejecuta consultas de solo lectura contra el diccionario de datos de Oracle
 * y las vistas/funciones creadas en los scripts académicos.
 */
@Injectable()
export class ShowcaseService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Valida que el rol del usuario tenga acceso a los endpoints de showcase.
   * Solo los roles admin y analista pueden consultar estos datos.
   */
  private assertShowcaseRole(role: string): void {
    const normalized = role.toLowerCase();
    if (normalized !== 'admin' && normalized !== 'analista') {
      throw new ForbiddenException(
        'Solo usuarios con rol admin o analista pueden acceder al showcase académico',
      );
    }
  }

  private toNumber(value: unknown): number {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private toText(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Date) return value.toISOString();
    return '';
  }

  private toNullableText(value: unknown): string | null {
    const text = this.toText(value);
    return text.length > 0 ? text : null;
  }

  // ========================================================================
  // NT1 — Consultas Avanzadas y Almacenamiento
  // ========================================================================

  /**
   * Retorna las particiones de la tabla REPRODUCCIONES.
   */
  async getPartitions(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        TABLE_NAME     AS "tableName",
        PARTITION_NAME AS "partitionName",
        HIGH_VALUE     AS "highValue",
        PARTITION_POSITION AS "partitionPosition"
      FROM USER_TAB_PARTITIONS
      WHERE TABLE_NAME = 'REPRODUCCIONES'
      ORDER BY PARTITION_POSITION
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Retorna las vistas materializadas del esquema.
   */
  async getMaterializedViews(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        MVIEW_NAME       AS "mviewName",
        LAST_REFRESH_DATE AS "lastRefreshDate",
        STALENESS         AS "staleness"
      FROM USER_MVIEWS
      WHERE MVIEW_NAME IN ('MV_CALIFICACIONES_PROMEDIO', 'MV_METRICAS_FINANCIERAS')
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Ejecuta una consulta PIVOT de muestra sobre reproducciones por dispositivo y mes.
   */
  async getPivotSample(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT *
      FROM (
        SELECT
          NVL(ULTIMO_DISPOSITIVO, 'Sin dispositivo') AS DISPOSITIVO,
          EXTRACT(MONTH FROM FECHA_INICIO) AS MES,
          ID_REPRODUCCION
        FROM REPRODUCCIONES
      )
      PIVOT (
        COUNT(ID_REPRODUCCION)
        FOR MES IN (
          1 AS MES_1, 2 AS MES_2, 3 AS MES_3,
          4 AS MES_4, 5 AS MES_5, 6 AS MES_6,
          7 AS MES_7, 8 AS MES_8, 9 AS MES_9,
          10 AS MES_10, 11 AS MES_11, 12 AS MES_12
        )
      )
      ORDER BY DISPOSITIVO
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Ejecuta una consulta ROLLUP de muestra sobre ingresos por año y mes.
   */
  async getRollupSample(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        PERIODO_ANIO  AS "periodoAnio",
        PERIODO_MES   AS "periodoMes",
        SUM(MONTO_FINAL)      AS "ingresosTotales",
        COUNT(ID_FACTURACION) AS "totalFacturas"
      FROM FACTURACIONES
      GROUP BY ROLLUP(PERIODO_ANIO, PERIODO_MES)
      ORDER BY PERIODO_ANIO NULLS LAST, PERIODO_MES NULLS LAST
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  // ========================================================================
  // NT2 — Programación PL/SQL
  // ========================================================================

  /**
   * Ejecuta una consulta que emula el cursor de cartera vencida (mayor a 30 días).
   */
  async getCarteraVencida(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        F.ID_FACTURACION                        AS "idFacturacion",
        U.NOMBRE                                AS "nombreUsuario",
        U.EMAIL                                 AS "email",
        F.PERIODO_ANIO                          AS "periodoAnio",
        F.PERIODO_MES                           AS "periodoMes",
        F.MONTO_FINAL                           AS "montoFinal",
        F.FECHA_VENCIMIENTO                     AS "fechaVencimiento",
        TRUNC(SYSDATE) - F.FECHA_VENCIMIENTO  AS "diasVencida"
      FROM FACTURACIONES F
      JOIN USUARIOS U ON U.ID_USUARIO = F.ID_USUARIO
      WHERE F.ESTADO_FACTURA = 'PENDIENTE'
        AND F.FECHA_VENCIMIENTO < TRUNC(SYSDATE) - 30
      ORDER BY "diasVencida" DESC
      FETCH FIRST 20 ROWS ONLY
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Calcula el monto final con descuentos por referidos y fidelidad.
   * Fallback SQL directo en caso de que la funcion PL/SQL no exista.
   */
  async getFunctionMonto(
    role: string,
    userId: number,
    year: number,
    month: number,
  ): Promise<Record<string, unknown>> {
    this.assertShowcaseRole(role);
    try {
      const sql = `SELECT FN_CALCULAR_MONTO(:1, :2, :3) AS montoFinal FROM DUAL`;
      const rows = await this.dataSource.query<Record<string, unknown>[]>(sql, [
        userId,
        year,
        month,
      ]);
      return rows[0] ?? { montoFinal: 0 };
    } catch {
      const fallbackSql = `
        SELECT
          ROUND(
            P.PRECIO_MENSUAL * (
              1 - LEAST(
                COALESCE((
                  SELECT SUM(R.DESCUENTO_PCT)
                  FROM REFERIDOS R
                  WHERE R.ID_USUARIO_REFERENTE = :1
                    AND R.ESTADO_REFERIDO = 'VALIDADO'
                ), 0),
                30
              ) / 100 - CASE
                WHEN MONTHS_BETWEEN(SYSDATE, U.FECHA_CREACION) >= 24 THEN 15
                WHEN MONTHS_BETWEEN(SYSDATE, U.FECHA_CREACION) >= 12 THEN 10
                ELSE 0
              END / 100
            ),
            2
          ) AS montoFinal
        FROM USUARIOS U
        JOIN PLANES P ON P.ID_PLAN = U.ID_PLAN
        WHERE U.ID_USUARIO = :2
      `;
      const rows = await this.dataSource.query<Record<string, unknown>[]>(
        fallbackSql,
        [userId, userId],
      );
      return rows[0] ?? { montoFinal: 0 };
    }
  }

  /**
   * Recomienda contenido basado en favoritos del perfil.
   * Fallback SQL directo en caso de que la funcion PL/SQL no exista.
   */
  async getFunctionRecommendation(
    role: string,
    profileId: number,
  ): Promise<Record<string, unknown>> {
    this.assertShowcaseRole(role);
    try {
      const sql = `SELECT FN_CONTENIDO_RECOMENDADO(:1) AS idContenido FROM DUAL`;
      const rows = await this.dataSource.query<Record<string, unknown>[]>(sql, [
        profileId,
      ]);
      return rows[0] ?? { idContenido: null };
    } catch {
      const fallbackSql = `
        SELECT ID_CONTENIDO AS idContenido
        FROM (
          SELECT C.ID_CONTENIDO, COUNT(R.ID_REPRODUCCION) AS popularidad
          FROM CONTENIDOS C
          JOIN CONTENIDOS_GENEROS CG ON CG.ID_CONTENIDO = C.ID_CONTENIDO
          LEFT JOIN REPRODUCCIONES R ON R.ID_CONTENIDO = C.ID_CONTENIDO
          WHERE CG.ID_GENERO IN (
            SELECT CG2.ID_GENERO
            FROM FAVORITOS F
            JOIN CONTENIDOS_GENEROS CG2 ON CG2.ID_CONTENIDO = F.ID_CONTENIDO
            WHERE F.ID_PERFIL = :1
          )
            AND C.ID_CONTENIDO NOT IN (
              SELECT ID_CONTENIDO FROM REPRODUCCIONES WHERE ID_PERFIL = :2
            )
          GROUP BY C.ID_CONTENIDO
          ORDER BY COUNT(R.ID_REPRODUCCION) DESC
        )
        WHERE ROWNUM = 1
      `;
      const rows = await this.dataSource.query<Record<string, unknown>[]>(
        fallbackSql,
        [profileId, profileId],
      );
      if (rows.length > 0) return rows[0];
      const globalSql = `
        SELECT C.ID_CONTENIDO AS idContenido
        FROM CONTENIDOS C
        LEFT JOIN REPRODUCCIONES R ON R.ID_CONTENIDO = C.ID_CONTENIDO
        WHERE C.ID_CONTENIDO NOT IN (
          SELECT ID_CONTENIDO FROM REPRODUCCIONES WHERE ID_PERFIL = :1
        )
        GROUP BY C.ID_CONTENIDO
        ORDER BY COUNT(R.ID_REPRODUCCION) DESC
        FETCH FIRST 1 ROW ONLY
      `;
      const globalRows = await this.dataSource.query<Record<string, unknown>[]>(
        globalSql,
        [profileId],
      );
      return globalRows[0] ?? { idContenido: null };
    }
  }

  /**
   * Retorna los triggers del esquema MINFLIX.
   */
  async getTriggers(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        TRIGGER_NAME   AS "triggerName",
        TABLE_NAME     AS "tableName",
        TRIGGER_TYPE   AS "triggerType",
        TRIGGERING_EVENT AS "triggeringEvent",
        STATUS         AS "status"
      FROM USER_TRIGGERS
      WHERE TABLE_NAME IN (
        'USUARIOS','PERFILES','REPRODUCCIONES','FACTURACIONES',
        'PAGOS','FAVORITOS','CALIFICACIONES','REPORTES','CONTENIDOS',
        'TEMPORADAS','EMPLEADOS'
      )
      ORDER BY TABLE_NAME, TRIGGER_NAME
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  // ========================================================================
  // NT3 — Transacciones y Concurrencia
  // ========================================================================

  /**
   * Muestra un usuario, su perfil y su ultima factura como ilustracion
   * de atomicidad (Transaccion 1).
   */
  async getTransactionAtomicDemo(
    role: string,
  ): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        U.ID_USUARIO    AS "idUsuario",
        U.NOMBRE        AS "nombreUsuario",
        U.EMAIL         AS "email",
        U.ROL           AS "rol",
        P.ID_PERFIL     AS "idPerfil",
        P.NOMBRE        AS "nombrePerfil",
        F.ID_FACTURACION AS "idFacturacion",
        F.PERIODO_ANIO   AS "periodoAnio",
        F.PERIODO_MES    AS "periodoMes",
        F.MONTO_FINAL    AS "montoFinal",
        F.ESTADO_FACTURA AS "estadoFactura"
      FROM USUARIOS U
      LEFT JOIN PERFILES P ON P.ID_USUARIO = U.ID_USUARIO
      LEFT JOIN FACTURACIONES F ON F.ID_USUARIO = U.ID_USUARIO
      WHERE U.EMAIL LIKE '%seed@minflix.local'
        AND ROWNUM <= 10
      ORDER BY U.ID_USUARIO, F.FECHA_CORTE DESC
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Muestra usuarios activos y sus facturas como ilustracion de SAVEPOINT
   * (Transaccion 2).
   */
  async getTransactionSavepointDemo(
    role: string,
  ): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        U.ID_USUARIO    AS "idUsuario",
        U.NOMBRE        AS "nombreUsuario",
        U.ESTADO_CUENTA AS "estadoCuenta",
        COUNT(F.ID_FACTURACION) AS "totalFacturas",
        SUM(CASE WHEN F.ESTADO_FACTURA = 'PAGADA' THEN 1 ELSE 0 END) AS "facturasPagadas",
        SUM(CASE WHEN F.ESTADO_FACTURA = 'PENDIENTE' THEN 1 ELSE 0 END) AS "facturasPendientes"
      FROM USUARIOS U
      LEFT JOIN FACTURACIONES F ON F.ID_USUARIO = U.ID_USUARIO
      WHERE U.ESTADO_CUENTA = 'ACTIVO'
        AND U.EMAIL LIKE '%seed@minflix.local'
      GROUP BY U.ID_USUARIO, U.NOMBRE, U.ESTADO_CUENTA
      ORDER BY U.ID_USUARIO
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Muestra los datos relacionados de un usuario como ilustracion de
   * eliminacion en cascada (Transaccion 3).
   */
  async getTransactionCascadeDemo(
    role: string,
  ): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        'USUARIO'        AS "entidad",
        U.ID_USUARIO     AS "id",
        U.NOMBRE         AS "nombre",
        U.EMAIL          AS "email"
      FROM USUARIOS U
      WHERE U.EMAIL = 'usuario.seed@minflix.local'
      UNION ALL
      SELECT 'PERFIL', P.ID_PERFIL, P.NOMBRE, NULL
      FROM PERFILES P
      WHERE P.ID_USUARIO = (SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = 'usuario.seed@minflix.local')
      UNION ALL
      SELECT 'REPRODUCCION', R.ID_REPRODUCCION, C.TITULO, TO_CHAR(R.FECHA_INICIO, 'YYYY-MM-DD')
      FROM REPRODUCCIONES R
      JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO
      WHERE R.ID_PERFIL IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = (SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = 'usuario.seed@minflix.local'))
      UNION ALL
      SELECT 'FAVORITO', F.ID_FAVORITO, C.TITULO, NULL
      FROM FAVORITOS F
      JOIN CONTENIDOS C ON C.ID_CONTENIDO = F.ID_CONTENIDO
      WHERE F.ID_PERFIL IN (SELECT ID_PERFIL FROM PERFILES WHERE ID_USUARIO = (SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = 'usuario.seed@minflix.local'))
      FETCH FIRST 20 ROWS ONLY
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Muestra bloqueos actuales como ilustracion de concurrencia (SELECT FOR UPDATE).
   */
  async getConcurrencyLocks(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    try {
      const sql = `
        SELECT
          L.SESSION_ID     AS "sessionId",
          L.LOCK_TYPE      AS "lockType",
          L.MODE_HELD      AS "modeHeld",
          L.MODE_REQUESTED AS "modeRequested",
          L.LOCK_ID1       AS "lockId1",
          L.LOCK_ID2       AS "lockId2"
        FROM GV$LOCK L
        JOIN GV$SESSION S ON S.SID = L.SESSION_ID
        WHERE S.USERNAME IS NOT NULL
          AND L.TYPE != 'MR'
        FETCH FIRST 20 ROWS ONLY
      `;
      return await this.dataSource.query<Record<string, unknown>[]>(sql);
    } catch {
      return [];
    }
  }

  /**
   * Retorna informacion de sesiones activas para ilustrar concurrencia.
   */
  async getSessionInfo(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    try {
      const sql = `
        SELECT
          SID      AS "sid",
          SERIAL#  AS "serial",
          USERNAME AS "username",
          STATUS   AS "status",
          PROGRAM  AS "program"
        FROM GV$SESSION
        WHERE USERNAME IS NOT NULL
          AND STATUS = 'ACTIVE'
        FETCH FIRST 20 ROWS ONLY
      `;
      return await this.dataSource.query<Record<string, unknown>[]>(sql);
    } catch {
      return [];
    }
  }

  // ========================================================================
  // NT4 — Estrategias de Indexación
  // ========================================================================

  /**
   * Retorna los índices creados en los scripts académicos.
   */
  async getIndexes(role: string): Promise<Record<string, unknown>[]> {
    this.assertShowcaseRole(role);
    const sql = `
      SELECT
        IC.INDEX_NAME   AS "indexName",
        IC.TABLE_NAME   AS "tableName",
        IC.COLUMN_NAME  AS "columnName",
        IC.COLUMN_POSITION AS "columnPosition",
        IC.DESCEND      AS "descend",
        I.INDEX_TYPE    AS "indexType"
      FROM USER_IND_COLUMNS IC
      JOIN USER_INDEXES I ON I.INDEX_NAME = IC.INDEX_NAME
      WHERE IC.INDEX_NAME IN (
        'IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO',
        'IDX_CONTENIDOS_CATEGORIA_ANIO',
        'IDX_USUARIOS_CIUDAD_ESTADO',
        'IDX_CALIFICACIONES_CONTENIDO_FECHA',
        'IDX_REPRODUCCIONES_PERFIL_EVENTO',
        'IDX_REPRODUCCIONES_CONTENIDO',
        'IDX_REPRODUCCIONES_ESTADO'
      )
      ORDER BY IC.INDEX_NAME, IC.COLUMN_POSITION
    `;
    return this.dataSource.query<Record<string, unknown>[]>(sql);
  }

  /**
   * Retorna el plan de ejecución almacenado para una consulta de muestra.
   * Oracle no permite ejecutar EXPLAIN PLAN desde usuarios sin privilegios
   * de DDL sobre PLAN_TABLE en algunos entornos; por tanto se usa una
   * consulta pre-optimizada cuyo plan puede verse con DBMS_XPLAN en SQL Developer.
   * Este endpoint retorna la consulta misma como referencia académica.
   */
  getExplainPlanReference(role: string): Promise<Record<string, unknown>> {
    this.assertShowcaseRole(role);
    return Promise.resolve({
      consulta: `SELECT R.ID_REPRODUCCION, C.TITULO, R.FECHA_INICIO FROM REPRODUCCIONES R JOIN CONTENIDOS C ON C.ID_CONTENIDO = R.ID_CONTENIDO WHERE R.ID_PERFIL = :perfil ORDER BY R.FECHA_INICIO DESC FETCH FIRST 50 ROWS ONLY`,
      indiceRelevante: 'IDX_REPRODUCCIONES_PERFIL_FECHA_INICIO',
      nota: 'Ejecutar EXPLAIN PLAN en SQL Developer para ver INDEX RANGE SCAN vs FULL TABLE SCAN',
    });
  }
}
