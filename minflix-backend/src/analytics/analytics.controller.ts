import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import {
  ConsumptionRow,
  FinanceAnalyticsRow,
  PerformanceRow,
} from './contracts/analytics-view.types';
import { AnalyticsConsumptionQueryDto } from './dto/analytics-consumption-query.dto';
import { AnalyticsFinanceQueryDto } from './dto/analytics-finance-query.dto';
import { AnalyticsPerformanceQueryDto } from './dto/analytics-performance-query.dto';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Controlador de analitica ejecutiva para consumo, finanzas y rendimiento interno.
 * Todos los endpoints son exclusivos para roles admin y analista.
 */
@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Retorna datos de consumo de contenido agrupados por ciudad, categoria,
   * genero, dispositivo, plan y periodo mensual.
   * @param req - Request autenticado con rol del usuario.
   * @param query - Filtros opcionales de dimension.
   * @returns Filas de VW_ANALITICA_CONSUMO filtradas.
   */
  @ApiOperation({
    summary:
      'Analitica de consumo de contenido por ciudad, categoria, dispositivo y plan (admin/analista)',
  })
  @Get('consumption')
  getConsumption(
    @Req() req: AuthenticatedRequest,
    @Query() query: AnalyticsConsumptionQueryDto,
  ): Promise<ConsumptionRow[]> {
    return this.analyticsService.getConsumption(req.user.role, query);
  }

  /**
   * Retorna metricas de ingresos segmentadas por ciudad, plan y periodo
   * de facturacion para analisis ejecutivo financiero.
   * @param req - Request autenticado con rol del usuario.
   * @param query - Filtros opcionales de ciudad, plan y periodo.
   * @returns Filas de VW_ANALITICA_FINANZAS filtradas.
   */
  @ApiOperation({
    summary:
      'Analitica financiera de ingresos por ciudad y plan de suscripcion (admin/analista)',
  })
  @Get('finance')
  getFinance(
    @Req() req: AuthenticatedRequest,
    @Query() query: AnalyticsFinanceQueryDto,
  ): Promise<FinanceAnalyticsRow[]> {
    return this.analyticsService.getFinance(req.user.role, query);
  }

  /**
   * Retorna metricas de rendimiento interno del equipo por departamento
   * y cohort de ingreso para analisis de productividad organizacional.
   * @param req - Request autenticado con rol del usuario.
   * @param query - Filtros opcionales de departamento y ano de ingreso.
   * @returns Filas de VW_ANALITICA_RENDIMIENTO filtradas.
   */
  @ApiOperation({
    summary:
      'Rendimiento interno del equipo por departamento y cohort de ingreso (admin/analista)',
  })
  @Get('internal-performance')
  getInternalPerformance(
    @Req() req: AuthenticatedRequest,
    @Query() query: AnalyticsPerformanceQueryDto,
  ): Promise<PerformanceRow[]> {
    return this.analyticsService.getInternalPerformance(req.user.role, query);
  }
}
