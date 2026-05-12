/**
 * DTO para crear perfiles adicionales en una cuenta existente.
 *
 * Define la estructura y validación de los datos enviados por el cliente
 * al endpoint `POST /api/v1/auth/profiles` para agregar un nuevo perfil
 * de reproducción a la cuenta autenticada.
 *
 * @see {@link AuthController.createProfile} para el endpoint que consume este DTO
 * @see {@link AuthService.createProfile} para la lógica de validación de límites
 * @see {@link ProfileEntity} para la entidad de perfiles en la base de datos
 */

// --------------------------------------------------------------------------
// Importaciones de Swagger y class-validator
// --------------------------------------------------------------------------

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de validación de datos de entrada */
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para crear perfiles adicionales en una cuenta existente.
 */
export class CreateProfileDto {
  /**
   * Nombre visible del perfil.
   */
  @ApiProperty({ example: 'Camila' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre!: string;

  /**
   * Tipo del perfil para control de clasificacion.
   */
  @ApiProperty({ example: 'adulto', enum: ['adulto', 'infantil'] })
  @IsString()
  @IsIn(['adulto', 'infantil'])
  tipoPerfil!: string;

  /**
   * Avatar opcional del perfil.
   */
  @ApiPropertyOptional({
    example: 'https://cdn.minflix.dev/avatars/camila.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}
