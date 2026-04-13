import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entities';
import {
  FinanceSummaryView,
  InvoiceItemView,
  MockCheckoutPaymentView,
  PaymentItemView,
  ReferralItemView,
} from './contracts/finance-view.types';
import { CheckoutPaymentDto } from './dto/checkout-payment.dto';
import { ListInvoicesQueryDto } from './dto/list-invoices-query.dto';
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto';
import { ListReferralsQueryDto } from './dto/list-referrals-query.dto';
import { InvoiceEntity, PaymentEntity, ReferralEntity } from './entities';

/**
 * Servicio financiero para lectura de facturacion, pagos y referidos.
 */
@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(ReferralEntity)
    private readonly referralRepository: Repository<ReferralEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Construye resumen financiero de la cuenta autenticada.
   * @param userId - Cuenta autenticada.
   * @returns Vista de resumen financiero consolidado.
   */
  async getFinanceSummary(userId: number): Promise<FinanceSummaryView> {
    const user = await this.ensureUserExists(userId);

    const [
      totalFacturas,
      facturasPendientesOVencidas,
      facturaVigente,
      totalPagadoRaw,
      descuentoReferidosRaw,
    ] = await Promise.all([
      this.invoiceRepository
        .createQueryBuilder('factura')
        .innerJoin('factura.usuario', 'usuario')
        .where('usuario.id = :userId', { userId })
        .getCount(),
      this.invoiceRepository
        .createQueryBuilder('factura')
        .innerJoin('factura.usuario', 'usuario')
        .where('usuario.id = :userId', { userId })
        .andWhere('factura.estadoFactura IN (:...estados)', {
          estados: ['PENDIENTE', 'VENCIDA'],
        })
        .getCount(),
      this.invoiceRepository
        .createQueryBuilder('factura')
        .innerJoin('factura.usuario', 'usuario')
        .where('usuario.id = :userId', { userId })
        .orderBy('factura.periodoAnio', 'DESC')
        .addOrderBy('factura.periodoMes', 'DESC')
        .addOrderBy('factura.fechaCorte', 'DESC')
        .getOne(),
      this.paymentRepository
        .createQueryBuilder('pago')
        .innerJoin('pago.usuario', 'usuario')
        .select('NVL(SUM(pago.monto), 0)', 'totalPagado')
        .where('usuario.id = :userId', { userId })
        .andWhere('pago.estadoTransaccion = :estado', {
          estado: 'EXITOSO',
        })
        .getRawOne<{ totalPagado: string | number | null }>(),
      this.referralRepository
        .createQueryBuilder('referido')
        .innerJoin('referido.usuarioReferente', 'referente')
        .innerJoin('referido.usuarioReferido', 'referidoUsuario')
        .select('NVL(MAX(referido.descuentoPct), 0)', 'descuento')
        .where('(referente.id = :userId OR referidoUsuario.id = :userId)', {
          userId,
        })
        .andWhere('referido.estadoReferido = :estado', {
          estado: 'VALIDADO',
        })
        .getRawOne<{ descuento: string | number | null }>(),
    ]);

    return {
      usuarioId: user.id,
      email: user.email,
      estadoCuenta: user.estadoCuenta,
      totalFacturas,
      facturasPendientesOVencidas,
      totalPagadoExitoso: this.parseOracleNumber(totalPagadoRaw?.totalPagado),
      descuentoReferidosActivoPct: this.parseOracleNumber(
        descuentoReferidosRaw?.descuento,
      ),
      facturaVigente: facturaVigente ? this.mapInvoice(facturaVigente) : null,
    };
  }

  /**
   * Lista facturas historicas de la cuenta autenticada.
   * @param userId - Cuenta autenticada.
   * @param query - Filtros opcionales de periodo y estado.
   * @returns Coleccion de facturas para respuesta API.
   */
  async listInvoices(
    userId: number,
    query: ListInvoicesQueryDto,
  ): Promise<InvoiceItemView[]> {
    await this.ensureUserExists(userId);

    const invoicesQuery = this.invoiceRepository
      .createQueryBuilder('factura')
      .innerJoin('factura.usuario', 'usuario')
      .where('usuario.id = :userId', { userId });

    if (query.anio !== undefined) {
      invoicesQuery.andWhere('factura.periodoAnio = :anio', {
        anio: query.anio,
      });
    }

    if (query.mes !== undefined) {
      invoicesQuery.andWhere('factura.periodoMes = :mes', {
        mes: query.mes,
      });
    }

    if (query.estado) {
      invoicesQuery.andWhere('factura.estadoFactura = :estado', {
        estado: query.estado,
      });
    }

    const invoices = await invoicesQuery
      .orderBy('factura.periodoAnio', 'DESC')
      .addOrderBy('factura.periodoMes', 'DESC')
      .take(query.limit ?? 12)
      .getMany();

    return invoices.map((invoice) => this.mapInvoice(invoice));
  }

  /**
   * Lista transacciones de pago de la cuenta autenticada.
   * @param userId - Cuenta autenticada.
   * @param query - Filtros opcionales del historial.
   * @returns Coleccion de pagos para respuesta API.
   */
  async listPayments(
    userId: number,
    query: ListPaymentsQueryDto,
  ): Promise<PaymentItemView[]> {
    await this.ensureUserExists(userId);

    const paymentsQuery = this.paymentRepository
      .createQueryBuilder('pago')
      .innerJoinAndSelect('pago.factura', 'factura')
      .innerJoin('pago.usuario', 'usuario')
      .where('usuario.id = :userId', { userId });

    if (query.estadoTransaccion) {
      paymentsQuery.andWhere('pago.estadoTransaccion = :estado', {
        estado: query.estadoTransaccion,
      });
    }

    const payments = await paymentsQuery
      .orderBy('pago.fechaPago', 'DESC')
      .take(query.limit ?? 20)
      .getMany();

    return payments.map((payment) => this.mapPayment(payment));
  }

  /**
   * Simula el pago de una factura con datos de tarjeta sin usar pasarela externa.
   * @param userId - Cuenta autenticada que ejecuta el pago.
   * @param payload - Datos del formulario de pago simulado.
   * @returns Resultado del pago simulado con factura actualizada.
   */
  async checkoutPayment(
    userId: number,
    payload: CheckoutPaymentDto,
  ): Promise<MockCheckoutPaymentView> {
    const user = await this.ensureUserExists(userId);

    const invoice = await this.invoiceRepository
      .createQueryBuilder('factura')
      .innerJoin('factura.usuario', 'usuario')
      .where('usuario.id = :userId', { userId })
      .andWhere('factura.id = :invoiceId', {
        invoiceId: payload.idFacturacion,
      })
      .getOne();

    if (!invoice) {
      throw new NotFoundException(
        'No existe una factura para el pago solicitado',
      );
    }

    if (!['PENDIENTE', 'VENCIDA'].includes(invoice.estadoFactura)) {
      throw new BadRequestException(
        'Solo se pueden pagar facturas en estado pendiente o vencida',
      );
    }

    const paymentReference = this.buildMockPaymentReference(invoice.id);

    await this.paymentRepository.save(
      this.paymentRepository.create({
        factura: invoice,
        usuario: user,
        monto: Number(invoice.montoFinal),
        metodoPago: payload.metodoPago,
        estadoTransaccion: 'EXITOSO',
        referenciaPago: paymentReference,
      }),
    );

    const persistedPayment = await this.paymentRepository
      .createQueryBuilder('pago')
      .innerJoinAndSelect('pago.factura', 'factura')
      .where('pago.referenciaPago = :paymentReference', {
        paymentReference,
      })
      .getOne();

    if (!persistedPayment) {
      throw new NotFoundException('No fue posible recuperar el pago simulado');
    }

    const updatedInvoice = await this.invoiceRepository.findOne({
      where: { id: invoice.id },
    });

    if (!updatedInvoice) {
      throw new NotFoundException(
        'No fue posible recuperar la factura actualizada',
      );
    }

    return {
      mensaje:
        'Pago simulado aprobado. No se realizo cobro real ni conexion con pasarela externa.',
      pago: this.mapPayment(persistedPayment),
      facturaActualizada: this.mapInvoice(updatedInvoice),
    };
  }

  /**
   * Lista relaciones de referidos vinculadas al usuario autenticado.
   * @param userId - Cuenta autenticada.
   * @param query - Filtros opcionales de tipo y estado.
   * @returns Coleccion de relaciones de referidos.
   */
  async listReferrals(
    userId: number,
    query: ListReferralsQueryDto,
  ): Promise<ReferralItemView[]> {
    await this.ensureUserExists(userId);

    const referralsQuery = this.referralRepository
      .createQueryBuilder('referido')
      .innerJoinAndSelect('referido.usuarioReferente', 'referente')
      .innerJoinAndSelect('referido.usuarioReferido', 'referidoUsuario');

    if (query.tipoRelacion === 'REFERENTE') {
      referralsQuery.where('referente.id = :userId', { userId });
    } else if (query.tipoRelacion === 'REFERIDO') {
      referralsQuery.where('referidoUsuario.id = :userId', { userId });
    } else {
      referralsQuery.where(
        '(referente.id = :userId OR referidoUsuario.id = :userId)',
        {
          userId,
        },
      );
    }

    if (query.estado) {
      referralsQuery.andWhere('referido.estadoReferido = :estado', {
        estado: query.estado,
      });
    }

    const referrals = await referralsQuery
      .orderBy('referido.fechaReferido', 'DESC')
      .take(query.limit ?? 20)
      .getMany();

    return referrals.map((referral) => this.mapReferral(userId, referral));
  }

  /**
   * Valida que la cuenta autenticada exista en base de datos.
   * @param userId - Cuenta autenticada.
   * @returns Usuario encontrado.
   */
  private async ensureUserExists(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('No existe la cuenta autenticada');
    }

    return user;
  }

  /**
   * Mapea una entidad de factura al contrato de respuesta.
   * @param invoice - Entidad de factura.
   * @returns Factura serializable para API.
   */
  private mapInvoice(invoice: InvoiceEntity): InvoiceItemView {
    return {
      idFacturacion: invoice.id,
      periodoAnio: invoice.periodoAnio,
      periodoMes: invoice.periodoMes,
      fechaCorte: invoice.fechaCorte,
      fechaVencimiento: invoice.fechaVencimiento,
      montoBase: Number(invoice.montoBase),
      descuentoReferidosPct: Number(invoice.descuentoReferidosPct),
      descuentoFidelidadPct: Number(invoice.descuentoFidelidadPct),
      montoFinal: Number(invoice.montoFinal),
      estadoFactura: invoice.estadoFactura,
      fechaPago: invoice.fechaPago ?? null,
    };
  }

  /**
   * Mapea una entidad de pago al contrato de respuesta.
   * @param payment - Entidad de pago hidratada con factura.
   * @returns Pago serializable para API.
   */
  private mapPayment(payment: PaymentEntity): PaymentItemView {
    return {
      idPago: payment.id,
      idFacturacion: payment.factura.id,
      periodoAnio: payment.factura.periodoAnio,
      periodoMes: payment.factura.periodoMes,
      fechaPago: payment.fechaPago,
      monto: Number(payment.monto),
      metodoPago: payment.metodoPago,
      estadoTransaccion: payment.estadoTransaccion,
      referenciaPago: payment.referenciaPago ?? null,
    };
  }

  /**
   * Mapea una entidad de referido al contrato de respuesta.
   * @param userId - Cuenta autenticada para resolver tipo de relacion.
   * @param referral - Entidad de referido hidratada.
   * @returns Referido serializable para API.
   */
  private mapReferral(
    userId: number,
    referral: ReferralEntity,
  ): ReferralItemView {
    const isReferente = referral.usuarioReferente.id === userId;

    return {
      idReferido: referral.id,
      tipoRelacion: isReferente ? 'REFERENTE' : 'REFERIDO',
      usuarioReferenteEmail: referral.usuarioReferente.email,
      usuarioReferidoEmail: referral.usuarioReferido.email,
      usuarioRelacionadoEmail: isReferente
        ? referral.usuarioReferido.email
        : referral.usuarioReferente.email,
      estadoReferido: referral.estadoReferido,
      descuentoPct: Number(referral.descuentoPct),
      fechaReferido: referral.fechaReferido,
    };
  }

  /**
   * Convierte valores Oracle crudos a numero seguro para respuestas API.
   * @param value - Valor crudo proveniente de una agregacion SQL.
   * @returns Numero parseado o cero cuando no es valido.
   */
  private parseOracleNumber(value: string | number | null | undefined): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  }

  /**
   * Genera referencia unica para pagos simulados de interfaz.
   * @param invoiceId - Factura objetivo del pago simulado.
   * @returns Referencia de auditoria para registrar la transaccion.
   */
  private buildMockPaymentReference(invoiceId: number): string {
    const timestamp = Date.now();
    return `MOCK-CHECKOUT-${invoiceId}-${timestamp}`;
  }
}
