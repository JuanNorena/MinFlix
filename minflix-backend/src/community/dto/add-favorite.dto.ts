/**
 * DTO para agregar un contenido a favoritos.
 *
 * Define los datos necesarios para que un perfil marque un contenido
 * como favorito en su lista personal.
 *
 * @see {@link CommunityController.addFavorite} para el endpoint que consume este DTO
 * @see {@link CommunityService.addFavorite} para la lógica de validación y registro
 */

/** Decorador de documentación de propiedades para Swagger */
import { ApiProperty } from '@nestjs/swagger';

/** Decorador de transformación de tipos */
import { Type } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsInt, Min } from 'class-validator';

/**
 * DTO para agregar un contenido a favoritos.
 */
export class AddFavoriteDto {
  /**
   * Perfil que marca el contenido.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Contenido a marcar como favorito.
   */
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contenidoId!: number;
}
