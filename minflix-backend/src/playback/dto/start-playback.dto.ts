import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO para registrar el inicio de una reproduccion.
 */
export class StartPlaybackDto {
  /**
   * Identificador del perfil activo.
   */
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Identificador del contenido que se empieza a reproducir.
   */
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  contenidoId!: number;

  /**
   * Duracion total del contenido en segundos.
   */
  @ApiPropertyOptional({ example: 5400 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999999999)
  duracionTotalSegundos?: number;

  /**
   * Dispositivo desde el cual inicia la reproduccion.
   */
  @ApiPropertyOptional({ example: 'Smart TV Sala' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  ultimoDispositivo?: string;
}
