/**
 * DTO para solicitar inicio de sesión con Passport local.
 *
 * Define la estructura y validación de las credenciales enviadas
 * por el cliente al endpoint `POST /api/v1/auth/login`.
 *
 * @see {@link AuthController.login} para el endpoint que consume este DTO
 * @see {@link LocalStrategy} para la estrategia que valida estas credenciales
 */

// --------------------------------------------------------------------------
// Importaciones de Swagger y class-validator
// --------------------------------------------------------------------------

/** Decorador de documentación de propiedades para Swagger */
import { ApiProperty } from '@nestjs/swagger';

/** Decoradores de validación de datos de entrada */
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para solicitar inicio de sesión con Passport local.
 */
export class LoginDto {
  /**
   * Correo del usuario.
   */
  @ApiProperty({ example: 'admin@minflix.com' })
  @IsEmail()
  email!: string;

  /**
   * Contrasena del usuario.
   */
  @ApiProperty({ example: 'Admin123*' })
  @IsString()
  @MinLength(8)
  password!: string;
}
