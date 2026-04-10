import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

/**
 * DTO de consulta para remover favoritos por perfil.
 */
export class RemoveFavoriteQueryDto {
  /**
   * Perfil que elimina el favorito.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;
}
