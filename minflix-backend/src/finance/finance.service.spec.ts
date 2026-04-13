import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/entities';
import { FinanceService } from './finance.service';
import { InvoiceEntity, PaymentEntity, ReferralEntity } from './entities';

describe('FinanceService', () => {
  let service: FinanceService;
  let invoiceRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
  };
  let paymentRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let referralRepository: {
    createQueryBuilder: jest.Mock;
  };
  let userRepository: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    invoiceRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    };

    paymentRepository = {
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    referralRepository = {
      createQueryBuilder: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    service = new FinanceService(
      invoiceRepository as unknown as Repository<InvoiceEntity>,
      paymentRepository as unknown as Repository<PaymentEntity>,
      referralRepository as unknown as Repository<ReferralEntity>,
      userRepository as unknown as Repository<UserEntity>,
    );
  });

  it('debe construir resumen financiero consolidado', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 33,
      email: 'adulto@minflix.dev',
      estadoCuenta: 'ACTIVA',
    } as UserEntity);

    const totalInvoicesQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(4),
    };

    const pendingInvoicesQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(2),
    };

    const currentInvoiceQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 700,
        periodoAnio: 2026,
        periodoMes: 5,
        fechaCorte: new Date('2026-05-01T00:00:00.000Z'),
        fechaVencimiento: new Date('2026-05-10T00:00:00.000Z'),
        montoBase: '9.99',
        descuentoReferidosPct: '5',
        descuentoFidelidadPct: '0',
        montoFinal: '9.49',
        estadoFactura: 'PENDIENTE',
        fechaPago: null,
      }),
    };

    const paymentsAggregationQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ totalPagado: '19.98' }),
    };

    const referralsAggregationQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ descuento: '10' }),
    };

    invoiceRepository.createQueryBuilder
      .mockReturnValueOnce(totalInvoicesQueryBuilder)
      .mockReturnValueOnce(pendingInvoicesQueryBuilder)
      .mockReturnValueOnce(currentInvoiceQueryBuilder);
    paymentRepository.createQueryBuilder.mockReturnValue(
      paymentsAggregationQueryBuilder,
    );
    referralRepository.createQueryBuilder.mockReturnValue(
      referralsAggregationQueryBuilder,
    );

    const result = await service.getFinanceSummary(33);

    expect(result).toMatchObject({
      usuarioId: 33,
      email: 'adulto@minflix.dev',
      estadoCuenta: 'ACTIVA',
      totalFacturas: 4,
      facturasPendientesOVencidas: 2,
      totalPagadoExitoso: 19.98,
      descuentoReferidosActivoPct: 10,
      facturaVigente: {
        idFacturacion: 700,
        periodoAnio: 2026,
        periodoMes: 5,
      },
    });
  });

  it('debe listar facturas aplicando filtros y limite', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 8,
      email: 'viewer@minflix.dev',
      estadoCuenta: 'ACTIVA',
    } as UserEntity);

    const invoicesListQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 120,
          periodoAnio: 2026,
          periodoMes: 4,
          fechaCorte: new Date('2026-04-01T00:00:00.000Z'),
          fechaVencimiento: new Date('2026-04-10T00:00:00.000Z'),
          montoBase: '9.99',
          descuentoReferidosPct: '0',
          descuentoFidelidadPct: '5',
          montoFinal: '9.49',
          estadoFactura: 'PAGADA',
          fechaPago: new Date('2026-04-07T10:00:00.000Z'),
        },
      ]),
    };

    invoiceRepository.createQueryBuilder.mockReturnValue(
      invoicesListQueryBuilder,
    );

    const result = await service.listInvoices(8, {
      anio: 2026,
      mes: 4,
      estado: 'PAGADA',
      limit: 6,
    });

    expect(invoicesListQueryBuilder.andWhere).toHaveBeenCalledWith(
      'factura.periodoAnio = :anio',
      { anio: 2026 },
    );
    expect(invoicesListQueryBuilder.andWhere).toHaveBeenCalledWith(
      'factura.periodoMes = :mes',
      { mes: 4 },
    );
    expect(invoicesListQueryBuilder.andWhere).toHaveBeenCalledWith(
      'factura.estadoFactura = :estado',
      { estado: 'PAGADA' },
    );
    expect(invoicesListQueryBuilder.take).toHaveBeenCalledWith(6);
    expect(result[0]).toMatchObject({
      idFacturacion: 120,
      estadoFactura: 'PAGADA',
    });
  });

  it('debe listar referidos donde el usuario es referente', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 3,
      email: 'owner@minflix.dev',
      estadoCuenta: 'ACTIVA',
    } as UserEntity);

    const referralsQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 44,
          usuarioReferente: { id: 3, email: 'owner@minflix.dev' },
          usuarioReferido: { id: 9, email: 'friend@minflix.dev' },
          estadoReferido: 'VALIDADO',
          descuentoPct: '10',
          fechaReferido: new Date('2026-05-10T12:00:00.000Z'),
        },
      ]),
    };

    referralRepository.createQueryBuilder.mockReturnValue(
      referralsQueryBuilder,
    );

    const result = await service.listReferrals(3, {
      tipoRelacion: 'REFERENTE',
      estado: 'VALIDADO',
      limit: 5,
    });

    expect(referralsQueryBuilder.where).toHaveBeenCalledWith(
      'referente.id = :userId',
      { userId: 3 },
    );
    expect(referralsQueryBuilder.take).toHaveBeenCalledWith(5);
    expect(result[0]).toMatchObject({
      idReferido: 44,
      tipoRelacion: 'REFERENTE',
      usuarioRelacionadoEmail: 'friend@minflix.dev',
    });
  });

  it('debe fallar cuando la cuenta autenticada no existe', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.listPayments(99, {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('debe procesar pago simulado exitoso para factura pendiente', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 15,
      email: 'demo@minflix.dev',
      estadoCuenta: 'ACTIVA',
    } as UserEntity);

    const pendingInvoice = {
      id: 501,
      periodoAnio: 2026,
      periodoMes: 5,
      fechaCorte: new Date('2026-05-01T00:00:00.000Z'),
      fechaVencimiento: new Date('2026-05-30T00:00:00.000Z'),
      montoBase: 14900,
      descuentoReferidosPct: 10,
      descuentoFidelidadPct: 0,
      montoFinal: 13410,
      estadoFactura: 'PENDIENTE',
      fechaPago: null,
    };

    const invoiceLookupQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(pendingInvoice),
    };

    const persistedPaymentQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: 9001,
        factura: pendingInvoice,
        fechaPago: new Date('2026-05-09T10:00:00.000Z'),
        monto: 13410,
        metodoPago: 'TARJETA_CREDITO',
        estadoTransaccion: 'EXITOSO',
        referenciaPago: 'MOCK-CHECKOUT-501-100000',
      }),
    };

    invoiceRepository.createQueryBuilder.mockReturnValue(
      invoiceLookupQueryBuilder,
    );
    paymentRepository.create.mockReturnValue({});
    paymentRepository.save.mockResolvedValue({});
    paymentRepository.createQueryBuilder.mockReturnValue(
      persistedPaymentQueryBuilder,
    );
    invoiceRepository.findOne.mockResolvedValue({
      ...pendingInvoice,
      estadoFactura: 'PAGADA',
      fechaPago: new Date('2026-05-09T10:00:00.000Z'),
    });

    const result = await service.checkoutPayment(15, {
      idFacturacion: 501,
      metodoPago: 'TARJETA_CREDITO',
      titularTarjeta: 'Demo Usuario',
      numeroTarjeta: '4111111111111111',
      fechaExpiracion: '11/29',
      cvv: '123',
    });

    expect(result.mensaje).toContain('Pago simulado aprobado');
    expect(result.pago).toMatchObject({
      idPago: 9001,
      idFacturacion: 501,
      estadoTransaccion: 'EXITOSO',
    });
    expect(result.facturaActualizada.estadoFactura).toBe('PAGADA');
  });
});
