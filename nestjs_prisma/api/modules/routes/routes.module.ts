import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { GoongService } from './services/goong.service';
import { RouteCacheService } from './services/route-cache.service';
import { GoongConfig } from '../../config/goong.config';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [RoutesController],
  providers: [RoutesService, GoongService, RouteCacheService, GoongConfig],
  exports: [RoutesService],
})
export class RoutesModule {}
