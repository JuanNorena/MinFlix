// --------------------------------------------------------------------------
// Importaciones de decoradores y utilidades de NestJS
// --------------------------------------------------------------------------

/** Decoradores de controladores, métodos HTTP, guardas y excepciones */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

/** Decoradores de documentación de Swagger para endpoints REST */
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

/** Guarda que protege endpoints requiriendo un token JWT válido */
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// --------------------------------------------------------------------------
// Importaciones de contratos, DTOs y servicios del módulo financiero
// --------------------------------------------------------------------------

/** Contratos de vistas para respuestas financieras */
import {
  FinanceSummaryView,
  InvoiceItemView,
  MockCheckoutPaymentView,
  PaymentItemView,
  ReferralItemView,
} from './contracts/finance-view.types';

/** DTO para simular pago de factura */
import { CheckoutPaymentDto } from './dto/checkout-payment.dto';

/** DTO de consulta para listar facturas */
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto';

/** DTO de consulta para listar pagos */
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto';

/** DTO de consulta para listar referidos */
import { ListReferralsQueryDto } from './dto/list-referrals-query.dto';

/** Servicio de lógica de negocio financiera */
import { FinanceService } from './finance.service';

/**
 * Tipo auxiliar para el objeto de petición autenticada.
 *
 * Extiende la petición de Express con los datos del usuario
 * extraídos del token JWT por Passport.
 */
interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Controlador financiero para estado de cuenta, pagos y referidos.
 */
@ApiTags('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  /**
   * Retorna resumen financiero consolidado para la cuenta autenticada.
   * @param req - Request autenticado.
   * @returns Resumen de estado de cuenta y descuentos activos.
   */
  @ApiOperation({
    summary: 'Obtener resumen financiero de la cuenta autenticada',
  })
  @Get('summary')
  getSummary(@Req() req: AuthenticatedRequest): Promise<FinanceSummaryView> {
    return this.financeService.getFinanceSummary(req.user.userId);
  }

  /**
   * Lista facturas historicas del usuario autenticado.
   * @param req - Request autenticado.
   * @param query - Filtros opcionales de periodo y estado.
   * @returns Coleccion de facturas del usuario.
   */
  @ApiOperation({ summary: 'Listar facturas de la cuenta autenticada' })
  @Get('invoices')
  listInvoices(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListInvoicesQueryDto,
  ): Promise<InvoiceItemView[]> {
    return this.financeService.listInvoices(req.user.userId, query);
  }

  /**
   * Lista historial de transacciones de pago del usuario autenticado.
   * @param req - Request autenticado.
   * @param query - Filtros opcionales de estado.
   * @returns Coleccion de pagos registrados.
   */
  @ApiOperation({ summary: 'Listar pagos de la cuenta autenticada' })
  @Get('payments')
  listPayments(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListPaymentsQueryDto,
  ): Promise<PaymentItemView[]> {
    return this.financeService.listPayments(req.user.userId, query);
  }

  /**
   * Lista relaciones de referidos donde participa el usuario autenticado.
   * @param req - Request autenticado.
   * @param query - Filtros opcionales de tipo de relacion y estado.
   * @returns Coleccion de relaciones de referidos del usuario.
   */
  @ApiOperation({
    summary: 'Listar referidos vinculados a la cuenta autenticada',
  })
  @Get('referrals')
  listReferrals(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListReferralsQueryDto,
  ): Promise<ReferralItemView[]> {
    return this.financeService.listReferrals(req.user.userId, query);
  }

  /**
   * Ejecuta pago simulado de una factura con datos de tarjeta (sin cobro real).
   * @param req - Request autenticado.
   * @param payload - Datos de formulario de pago simulado.
   * @returns Resultado del pago simulado con factura actualizada.
   */
  @ApiOperation({
    summary:
      'Simular pago con tarjeta para facturacion (sin integracion a pasarela real)',
  })
  @Post('payments/checkout')
  checkoutPayment(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CheckoutPaymentDto,
  ): Promise<MockCheckoutPaymentView> {
    return this.financeService.checkoutPayment(req.user.userId, payload);
  }
}
