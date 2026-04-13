import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { InvoiceEntity, PaymentEntity, ReferralEntity } from './entities';

/**
 * Modulo financiero para facturacion, pagos y referidos.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEntity,
      PaymentEntity,
      ReferralEntity,
      UserEntity,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
