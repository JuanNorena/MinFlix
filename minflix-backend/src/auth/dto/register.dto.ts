import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
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
