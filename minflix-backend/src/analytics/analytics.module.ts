import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * Modulo de analitica ejecutiva para consumo, finanzas y rendimiento interno.
 * No requiere TypeOrmModule.forFeature porque consulta vistas directamente
 * a traves del DataSource inyectado en el servicio.
 */
@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
