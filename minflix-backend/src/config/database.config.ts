/**
 * Configuración asíncrona de la conexión a Oracle Database con TypeORM.
 *
 * Este archivo centraliza la configuración de persistencia de MinFlix,
 * permitiendo que todos los módulos funcionales accedan a la misma
 * instancia de conexión a Oracle sin duplicar credenciales.
 *
 * **Variables de entorno soportadas:**
 * | Variable | Descripción | Valor por defecto |
 * |---|---|---|
 * | `DB_CONNECT_STRING` | Host, puerto y SID/PDB de Oracle | `localhost:1521/FREEPDB1` |
 * | `DB_USER` | Usuario de conexión a Oracle | `MINFLIX_APP` |
 * | `DB_PASSWORD` | Contraseña del usuario | `minflix_dev_123` |
 * | `DB_SCHEMA` | Esquema propietario de las tablas (uppercase) | — |
 * | `DB_LOGGING` | Habilita logs SQL cuando vale `true` | `false` |
 *
 * @see {@link AppModule} donde se importa esta configuración vía `TypeOrmModule.forRootAsync`
 */

// --------------------------------------------------------------------------
// Importaciones de NestJS Config y TypeORM
// --------------------------------------------------------------------------

/** Módulo y servicio de configuración para leer variables de entorno */
import { ConfigModule, ConfigService } from '@nestjs/config';

/** Tipo de opciones para configuración asíncrona de TypeORM */
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

/**
 * Opciones de conexión a Oracle Database para TypeORM.
 *
 * Se resuelve de forma asíncrona para permitir la lectura dinámica
 * de variables de entorno antes de establecer la conexión.
 */
export const databaseConfig: TypeOrmModuleAsyncOptions = {
  /** Importa ConfigModule para que ConfigService esté disponible en la fábrica */
  imports: [ConfigModule],

  /** Inyecta ConfigService para leer variables de entorno */
  inject: [ConfigService],

  /**
   * Fábrica que construye las opciones de conexión a Oracle.
   *
   * @param configService - Servicio de configuración con acceso a `.env`
   * @returns Objeto de opciones de TypeORM para Oracle
   */
  useFactory: (configService: ConfigService) => {
    /** Esquema de base de datos (owner de tablas), normalizado a mayúsculas */
    const schema = configService.get<string>('DB_SCHEMA')?.trim();

    return {
      /** Motor de base de datos: Oracle */
      type: 'oracle' as const,

      /** Cadena de conexión TNS simplificada (host:puerto/SID) */
      connectString:
        configService.get<string>('DB_CONNECT_STRING') ??
        'localhost:1521/FREEPDB1',

      /** Usuario de autenticación en Oracle */
      username: configService.get<string>('DB_USER') ?? 'MINFLIX_APP',

      /** Contraseña del usuario Oracle */
      password: configService.get<string>('DB_PASSWORD') ?? 'minflix_dev_123',

      /** Esquema (owner) donde residen las entidades; se normaliza a mayúsculas */
      schema: schema ? schema.toUpperCase() : undefined,

      /** Carga automáticamente todas las entidades registradas en módulos */
      autoLoadEntities: true,

      /** Desactiva `synchronize` para evitar modificaciones automáticas del DDL en producción */
      synchronize: false,

      /** Habilita logging SQL solo cuando la variable `DB_LOGGING` es exactamente `true` */
      logging: configService.get<string>('DB_LOGGING') === 'true',
    };
  },
};
