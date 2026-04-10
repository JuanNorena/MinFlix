import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO para crear categorias del catalogo.
 */
export class CreateCategoryDto {
  /**
   * Nombre comercial de la categoria.
   */
  @ApiProperty({ example: 'Accion' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nombre!: string;

  /**
   * Descripcion opcional de la categoria.
   */
  @ApiPropertyOptional({
    example: 'Contenido de ritmo rapido y alto conflicto.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(260)
  descripcion?: string;
}
