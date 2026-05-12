/**
 * DTO para acciones de moderación de reportes.
 *
 * Define los datos necesarios para que un moderador (rol soporte/admin)
 * actualice el estado de un reporte y registre una resolución.
 *
 * @see {@link CommunityController.moderateReport} para el endpoint que consume este DTO
 * @see {@link CommunityService.moderateReport} para la lógica de moderación
 */

/** Decoradores de documentación de propiedades para Swagger */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Decorador de transformación de datos de entrada */
import { Transform } from 'class-transformer';

/** Decoradores de validación de datos de entrada */
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para acciones de moderación de reportes.
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
