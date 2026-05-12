/**
 * DTO para crear o actualizar calificación por perfil.
 *
 * Define los datos para que un perfil califique un contenido
 * con puntaje de 1 a 5 estrellas y una reseña opcional.
 * Si ya existe una calificación, se actualiza (patrón upsert).
 *
 * @see {@link CommunityController.upsertRating} para el endpoint que consume este DTO
 * @see {@link CommunityService.upsertRating} para la lógica de validación y registro
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO para crear o actualizar calificación por perfil.
 */
export class UpsertRatingDto {
  /**
   * Perfil que emite la calificacion.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Contenido que sera calificado.
   */
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contenidoId!: number;

  /**
   * Puntaje del contenido en escala 1..5.
   */
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  puntaje!: number;

  /**
   * Reseña opcional del contenido.
   */
  @ApiPropertyOptional({ example: 'Buen ritmo narrativo y gran final.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resena?: string;
}
