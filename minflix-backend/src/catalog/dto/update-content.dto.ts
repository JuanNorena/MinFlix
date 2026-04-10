import { PartialType } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';

/**
 * DTO para actualizacion parcial de contenidos.
 */
export class UpdateContentDto extends PartialType(CreateContentDto) {}
