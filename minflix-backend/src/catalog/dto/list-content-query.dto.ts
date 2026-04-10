import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO de filtros para listar contenido del catalogo.
 */
export class ListContentQueryDto {
  /**
   * Texto libre para filtrar por titulo.
   */
  @ApiPropertyOptional({ example: 'ciudad' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  /**
   * Tipo de contenido para filtrar.
   */
  @ApiPropertyOptional({
    example: 'serie',
    enum: ['pelicula', 'serie', 'documental', 'musica', 'podcast'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pelicula', 'serie', 'documental', 'musica', 'podcast'])
  tipoContenido?: string;

  /**
   * Clasificacion por edad para filtrar.
   */
  @ApiPropertyOptional({
    example: '+13',
    enum: ['TP', '+7', '+13', '+16', '+18'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['TP', '+7', '+13', '+16', '+18'])
  clasificacionEdad?: string;

  /**
   * Id de categoria para filtrar.
   */
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoriaId?: number;

  /**
   * Filtro de exclusividad del contenido.
   */
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();
      if (normalizedValue === 'true' || normalizedValue === '1') {
        return true;
      }

      if (normalizedValue === 'false' || normalizedValue === '0') {
        return false;
      }

      return value;
    }

    return value;
  })
  @IsBoolean()
  exclusivo?: boolean;

  /**
   * Limite maximo de registros a retornar.
   */
  @ApiPropertyOptional({ example: 24, default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
