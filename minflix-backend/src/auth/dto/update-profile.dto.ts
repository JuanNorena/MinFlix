import { ApiPropertyOptional } from '@nestjs/swagger';
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
