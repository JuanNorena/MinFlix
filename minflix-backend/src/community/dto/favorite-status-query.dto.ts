import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

/**
 * DTO de consulta para saber si un contenido ya es favorito.
 */
export class FavoriteStatusQueryDto {
  /**
   * Perfil activo para evaluar el estado.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Contenido evaluado.
   */
  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contenidoId!: number;
}
