import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO para solicitar inicio de sesion con Passport local.
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
