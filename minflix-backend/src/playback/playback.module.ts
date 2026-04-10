import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from '../auth/entities';
import { ContentEntity } from '../catalog/entities';
import { PlaybackController } from './playback.controller';
import { PlaybackService } from './playback.service';
import { ContinueWatchingEntity, PlaybackEntity } from './entities';

/**
 * Modulo de reproduccion y continuidad de visualizacion.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlaybackEntity,
      ContinueWatchingEntity,
      ProfileEntity,
      ContentEntity,
    ]),
  ],
  controllers: [PlaybackController],
  providers: [PlaybackService],
  exports: [PlaybackService],
})
export class PlaybackModule {}
