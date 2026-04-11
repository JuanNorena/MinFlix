import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO de consulta para listar reportes de un perfil.
 */
export class ListReportsQueryDto {
  /**
   * Perfil propietario del historial consultado.
   */
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perfilId!: number;

  /**
   * Estado opcional para filtrar reportes.
   */
  @ApiPropertyOptional({
    example: 'ABIERTO',
    enum: ['ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsIn(['ABIERTO', 'EN_REVISION', 'RESUELTO', 'DESCARTADO'])
  estado?: string;

  /**
   * Limite maximo de filas a retornar.
   */
  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
