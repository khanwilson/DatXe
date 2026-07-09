import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { WebSocketModule } from './common/websocket/websocket.module';
import { RoutesModule } from './modules/routes/routes.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { TripModule } from './modules/trip/trip.module';
import { DriversModule } from './modules/drivers/drivers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    RedisModule,
    WebSocketModule,
    RoutesModule,
    BookingModule,
    PaymentModule,
    DriversModule,
    TripModule,
  ],
})
export class AppModule {}
