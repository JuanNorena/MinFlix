import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para acciones de moderacion de reportes.
 */
export class ModerateReportDto {
  /**
   * Estado destino de moderacion.
   */
  @ApiProperty({
    example: 'EN_REVISION',
    enum: ['EN_REVISION', 'RESUELTO', 'DESCARTADO'],
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsIn(['EN_REVISION', 'RESUELTO', 'DESCARTADO'])
  estado!: string;

  /**
   * Resolucion opcional del moderador.
   */
  @ApiPropertyOptional({
    example: 'Se valida el reporte y se restringe la visibilidad.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolucion?: string;
}
