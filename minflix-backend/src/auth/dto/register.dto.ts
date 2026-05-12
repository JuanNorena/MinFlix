/**
 * DTO para registrar una cuenta principal con perfil inicial.
 *
 * Define la estructura y validación de los datos enviados por el cliente
 * al endpoint `POST /api/v1/auth/register` para crear una nueva cuenta
 * de usuario, asignarle un plan de suscripción y generar un perfil inicial.
 *
 * @see {@link AuthController.register} para el endpoint que consume este DTO
 * @see {@link AuthService.register} para la lógica de creación de cuenta
 * @see {@link PlanEntity} para la entidad de planes de suscripción
 */

// --------------------------------------------------------------------------
// Importaciones de Swagger y class-validator
// --------------------------------------------------------------------------

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de validación de datos de entrada */
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * DTO para registrar una cuenta principal con perfil inicial.
 */
export class RegisterDto {
  /**
   * Nombre del titular de la cuenta.
   */
  @ApiProperty({ example: 'Laura Mendoza' })
  @IsString()
  @MinLength(3)
  nombre!: string;

  /**
   * Correo unico de autenticacion.
   */
  @ApiProperty({ example: 'laura@example.com' })
  @IsEmail()
  email!: string;

  /**
   * Telefono de contacto principal del usuario.
   */
  @ApiProperty({ example: '3001234567' })
  @IsString()
  @Matches(/^[0-9]{7,15}$/, {
    message: 'El telefono debe tener entre 7 y 15 digitos numericos',
  })
  telefono!: string;

  /**
   * Fecha de nacimiento del titular de la cuenta.
   */
  @ApiProperty({ example: '1998-04-19' })
  @IsDateString()
  fechaNacimiento!: string;

  /**
   * Ciudad de residencia declarada para analitica territorial.
   */
  @ApiProperty({ example: 'Bogota' })
  @IsString()
  @MinLength(2)
  ciudadResidencia!: string;

  /**
   * Contrasena en texto plano para generar hash seguro.
   */
  @ApiProperty({ example: 'Admin123*' })
  @IsString()
  @MinLength(8)
  password!: string;

  /**
   * Plan comercial para asociar la cuenta.
   */
  @ApiPropertyOptional({ example: 'BASICO', default: 'BASICO' })
  @IsOptional()
  @IsString()
  @IsIn(['BASICO', 'ESTANDAR', 'PREMIUM'])
  planNombre?: string;

  /**
   * Nombre del perfil inicial de reproduccion.
   */
  @ApiPropertyOptional({ example: 'Laura' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombrePerfilInicial?: string;
}
