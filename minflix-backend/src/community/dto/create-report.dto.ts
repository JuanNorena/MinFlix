import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * DTO para registrar reportes de contenido por perfil.
 */
export class CreateReportDto {
  /**
   * Perfil que reporta el contenido.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Contenido reportado.
   */
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contenidoId!: number;

  /**
   * Motivo principal del reporte.
   */
  @ApiProperty({ example: 'INAPROPIADO' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  motivo!: string;

  /**
   * Contexto opcional del reporte para moderacion.
   */
  @ApiPropertyOptional({
    example: 'El contenido muestra escenas no aptas para menores.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  detalle?: string;
}
