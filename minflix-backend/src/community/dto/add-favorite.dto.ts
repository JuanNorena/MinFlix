import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
