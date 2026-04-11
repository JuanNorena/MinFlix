import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { FavoriteEntity, RatingEntity } from './entities';

/**
 * Modulo de comunidad para funcionalidades sociales.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteEntity,
      RatingEntity,
      ProfileEntity,
      ContentEntity,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
