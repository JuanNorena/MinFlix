/**
 * DTO para actualizar datos editables del perfil.
 *
 * Define la estructura y validación de los datos enviados por el cliente
 * al endpoint `PATCH /api/v1/auth/profiles/:profileId` para modificar
 * un perfil de reproducción existente de la cuenta autenticada.
 *
 * @see {@link AuthController.updateProfile} para el endpoint que consume este DTO
 * @see {@link AuthService.updateProfile} para la lógica de actualización
 * @see {@link ProfileEntity} para la entidad de perfiles en la base de datos
 */

// --------------------------------------------------------------------------
// Importaciones de Swagger y class-validator
// --------------------------------------------------------------------------

/** Decorador de documentación de propiedades opcionales para Swagger */
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de validación de datos de entrada */
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para actualizar datos editables del perfil.
 */
export class UpdateProfileDto {
  /**
   * Nombre visible actualizado del perfil.
   */
  @ApiPropertyOptional({ example: 'Camila Kids' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre?: string;

  /**
   * Tipo de perfil actualizado para control de contenido.
   */
  @ApiPropertyOptional({ example: 'infantil', enum: ['adulto', 'infantil'] })
  @IsOptional()
  @IsString()
  @IsIn(['adulto', 'infantil'])
  tipoPerfil?: string;

  /**
   * Avatar actualizado del perfil.
   */
  @ApiPropertyOptional({
    example: 'https://cdn.minflix.dev/avatars/camila-kids.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;
}
