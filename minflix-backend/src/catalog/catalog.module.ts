import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CategoryEntity, ContentEntity } from './entities';

/**
 * Modulo de catalogo para la gestion de contenidos base.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, ContentEntity, UserEntity]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
