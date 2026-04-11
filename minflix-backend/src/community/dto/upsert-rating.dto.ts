import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO para crear o actualizar calificacion por perfil.
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
