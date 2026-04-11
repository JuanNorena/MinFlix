import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity, UserEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { FavoriteEntity, RatingEntity } from './entities';
import { ReportEntity } from './entities/report.entity';

/**
 * Modulo de comunidad para funcionalidades sociales.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteEntity,
      RatingEntity,
      ReportEntity,
      ProfileEntity,
      UserEntity,
      ContentEntity,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
