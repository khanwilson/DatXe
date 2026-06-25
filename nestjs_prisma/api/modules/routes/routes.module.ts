import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { GoogleMapsService } from './services/google-maps.service';
import { RouteCacheService } from './services/route-cache.service';
import { GoogleMapsConfig } from '../../config/google-maps.config';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [RoutesController],
  providers: [RoutesService, GoogleMapsService, RouteCacheService, GoogleMapsConfig],
  exports: [RoutesService],
})
export class RoutesModule {}
