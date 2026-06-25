import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { WebSocketModule } from './common/websocket/websocket.module';
import { RoutesModule } from './modules/routes/routes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RedisModule,
    WebSocketModule,
    RoutesModule,
  ],
})
export class AppModule {}
