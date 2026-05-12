/**
 * DTO para reportar progreso de reproducción.
 *
 * Define los datos enviados periódicamente por el cliente para actualizar
 * el avance de reproducción de un contenido: progreso en segundos,
 * duración total, dispositivo y estado actual.
 *
 * @see {@link PlaybackController.reportPlaybackProgress} para el endpoint que consume este DTO
 * @see {@link PlaybackService.reportPlaybackProgress} para la lógica de actualización
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decoradores de validación de datos de entrada */
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
 * DTO para reportar progreso de reproducción.
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
