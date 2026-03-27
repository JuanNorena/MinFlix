import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

/**
 * Configuracion asíncrona de TypeORM para Oracle.
 */
export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'oracle',
    connectString:
      configService.get<string>('DB_CONNECT_STRING') ??
      'localhost:1521/FREEPDB1',
    username: configService.get<string>('DB_USER') ?? 'MINFLIX_APP',
    password: configService.get<string>('DB_PASSWORD') ?? 'minflix_dev_123',
    autoLoadEntities: true,
    synchronize: false,
    logging: configService.get<string>('DB_LOGGING') === 'true',
  }),
};
