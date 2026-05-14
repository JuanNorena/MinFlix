// --------------------------------------------------------------------------
// Importaciones de decoradores y utilidades de NestJS
// --------------------------------------------------------------------------

/** Decoradores de controladores, métodos HTTP, parámetros y guardas */
import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

/** Decoradores de documentación de Swagger para endpoints REST */
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

/** Guarda que protege endpoints requiriendo un token JWT válido */
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// --------------------------------------------------------------------------
// Importaciones del servicio de showcase
// --------------------------------------------------------------------------

/** Servicio de demostración académica NT1..NT4 */
import { ShowcaseService } from './showcase.service';

/**
 * Tipo auxiliar para el objeto de petición autenticada.
 */
interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Controlador de demostración académica para los núcleos temáticos NT1..NT4.
 * Expone endpoints de solo lectura que ejecutan consultas SQL nativas
 * contra el diccionario de datos de Oracle y las vistas/funciones académicas.
 *
 * @remarks
 * Todos los endpoints requieren autenticación JWT y están restringidos
 * a roles **admin** y **analista**.
 */
@ApiTags('showcase')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('showcase')
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  // ========================================================================
  // NT1 — Consultas Avanzadas y Almacenamiento
  // ========================================================================

  @ApiOperation({
    summary: 'NT1: Particiones de REPRODUCCIONES (admin/analista)',
  })
  @Get('nt1/partitions')
  getPartitions(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getPartitions(req.user.role);
  }

  @ApiOperation({
    summary: 'NT1: Vistas materializadas del esquema (admin/analista)',
  })
  @Get('nt1/materialized-views')
  getMaterializedViews(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getMaterializedViews(req.user.role);
  }

  @ApiOperation({
    summary:
      'NT1: Ejemplo PIVOT reproducciones por dispositivo y mes (admin/analista)',
  })
  @Get('nt1/pivot-sample')
  getPivotSample(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getPivotSample(req.user.role);
  }

  @ApiOperation({
    summary: 'NT1: Ejemplo ROLLUP ingresos por año y mes (admin/analista)',
  })
  @Get('nt1/rollup-sample')
  getRollupSample(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getRollupSample(req.user.role);
  }

  // ========================================================================
  // NT2 — Programación PL/SQL
  // ========================================================================

  @ApiOperation({
    summary: 'NT2: Cartera vencida (emulación del cursor) (admin/analista)',
  })
  @Get('nt2/cartera-vencida')
  getCarteraVencida(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getCarteraVencida(req.user.role);
  }

  @ApiOperation({
    summary:
      'NT2: Ejecutar FN_CALCULAR_MONTO para un usuario y periodo (admin/analista)',
  })
  @Get('nt2/function-monto')
  getFunctionMonto(
    @Req() req: AuthenticatedRequest,
    @Query('userId', ParseIntPipe) userId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<Record<string, unknown>> {
    return this.showcaseService.getFunctionMonto(
      req.user.role,
      userId,
      year,
      month,
    );
  }

  @ApiOperation({
    summary:
      'NT2: Ejecutar FN_CONTENIDO_RECOMENDADO para un perfil (admin/analista)',
  })
  @Get('nt2/function-recommendation')
  getFunctionRecommendation(
    @Req() req: AuthenticatedRequest,
    @Query('profileId', ParseIntPipe) profileId: number,
  ): Promise<Record<string, unknown>> {
    return this.showcaseService.getFunctionRecommendation(
      req.user.role,
      profileId,
    );
  }

  @ApiOperation({
    summary: 'NT2: Listado de triggers del esquema (admin/analista)',
  })
  @Get('nt2/triggers')
  getTriggers(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getTriggers(req.user.role);
  }

  // ========================================================================
  // NT3 — Transacciones y Concurrencia
  // ========================================================================

  @ApiOperation({
    summary:
      'NT3: Demo atomicidad — usuario + perfil + factura (admin/analista)',
  })
  @Get('nt3/atomic-demo')
  getTransactionAtomicDemo(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getTransactionAtomicDemo(req.user.role);
  }

  @ApiOperation({
    summary:
      'NT3: Demo SAVEPOINT — usuarios activos y facturas (admin/analista)',
  })
  @Get('nt3/savepoint-demo')
  getTransactionSavepointDemo(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getTransactionSavepointDemo(req.user.role);
  }

  @ApiOperation({
    summary:
      'NT3: Demo cascada — datos relacionados de un usuario (admin/analista)',
  })
  @Get('nt3/cascade-demo')
  getTransactionCascadeDemo(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getTransactionCascadeDemo(req.user.role);
  }

  @ApiOperation({
    summary: 'NT3: Concurrencia — bloqueos actuales en Oracle (admin/analista)',
  })
  @Get('nt3/concurrency-locks')
  getConcurrencyLocks(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getConcurrencyLocks(req.user.role);
  }

  @ApiOperation({
    summary:
      'NT3: Sesiones activas (ilustración de concurrencia) (admin/analista)',
  })
  @Get('nt3/sessions')
  getSessionInfo(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getSessionInfo(req.user.role);
  }

  // ========================================================================
  // NT4 — Estrategias de Indexación
  // ========================================================================

  @ApiOperation({
    summary: 'NT4: Índices académicos creados en el esquema (admin/analista)',
  })
  @Get('nt4/indexes')
  getIndexes(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>[]> {
    return this.showcaseService.getIndexes(req.user.role);
  }

  @ApiOperation({
    summary: 'NT4: Referencia de consulta para EXPLAIN PLAN (admin/analista)',
  })
  @Get('nt4/explain-plan-reference')
  getExplainPlanReference(
    @Req() req: AuthenticatedRequest,
  ): Promise<Record<string, unknown>> {
    return this.showcaseService.getExplainPlanReference(req.user.role);
  }
}
