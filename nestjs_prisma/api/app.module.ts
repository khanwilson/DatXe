import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { WebSocketModule } from './common/websocket/websocket.module';
import { RoutesModule } from './modules/routes/routes.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';

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
    BookingModule,
    PaymentModule,
  ],
})
export class AppModule {}
