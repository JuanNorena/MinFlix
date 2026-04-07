import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
