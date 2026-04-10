import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * DTO para crear contenidos base del catalogo.
 */
export class CreateContentDto {
  /**
   * Titulo visible del contenido.
   */
  @ApiProperty({ example: 'La Ciudad de las Sombras' })
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  titulo!: string;

  /**
   * Tipo principal de contenido.
   */
  @ApiProperty({
    example: 'pelicula',
    enum: ['pelicula', 'serie', 'documental', 'musica', 'podcast'],
  })
  @IsString()
  @IsIn(['pelicula', 'serie', 'documental', 'musica', 'podcast'])
  tipoContenido!: string;

  /**
   * Clasificacion por edad.
   */
  @ApiProperty({ example: '+13', enum: ['TP', '+7', '+13', '+16', '+18'] })
  @IsString()
  @IsIn(['TP', '+7', '+13', '+16', '+18'])
  clasificacionEdad!: string;

  /**
   * Identificador de categoria del catalogo.
   */
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  categoriaId!: number;

  /**
   * Ano de lanzamiento del contenido.
   */
  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  anioLanzamiento?: number;

  /**
   * Duracion base en minutos.
   */
  @ApiPropertyOptional({ example: 118 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  duracionMinutos?: number;

  /**
   * Sinopsis principal del contenido.
   */
  @ApiPropertyOptional({
    example:
      'Una detective enfrenta una red criminal en una metropoli futurista.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  sinopsis?: string;

  /**
   * Bandera para contenidos exclusivos de MinFlix.
   */
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  esExclusivo?: boolean;
}
