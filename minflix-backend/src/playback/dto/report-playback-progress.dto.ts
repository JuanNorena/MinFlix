import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO para reportar progreso de reproduccion.
 */
export class ReportPlaybackProgressDto {
  /**
   * Identificador del perfil activo.
   */
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Identificador del contenido en reproduccion.
   */
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  contenidoId!: number;

  /**
   * Progreso acumulado del usuario en segundos.
   */
  @ApiProperty({ example: 1300 })
  @IsInt()
  @Min(0)
  @Max(9999999999)
  progresoSegundos!: number;

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
   * Dispositivo desde el cual se reporta el evento.
   */
  @ApiPropertyOptional({ example: 'Telefono Android' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  ultimoDispositivo?: string;

  /**
   * Estado del evento de reproduccion.
   */
  @ApiPropertyOptional({
    example: 'PAUSADO',
    enum: ['EN_PROGRESO', 'PAUSADO', 'FINALIZADO'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['EN_PROGRESO', 'PAUSADO', 'FINALIZADO'])
  estadoReproduccion?: string;
}
