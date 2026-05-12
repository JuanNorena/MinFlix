/**
 * DTO de consulta para listar favoritos por perfil.
 *
 * Define los parámetros de consulta para obtener la lista de favoritos
 * de un perfil, con opciones de paginación.
 *
 * @see {@link CommunityController.listFavorites} para el endpoint que consume este DTO
 * @see {@link CommunityService.listFavorites} para la lógica de consulta
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para listar favoritos por perfil.
 */
export class ListFavoritesQueryDto {
  /**
   * Perfil a consultar.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Limite maximo de favoritos a retornar.
   */
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
