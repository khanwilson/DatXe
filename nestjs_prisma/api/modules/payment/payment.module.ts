import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { WebSocketModule } from '../../common/websocket/websocket.module';

@Module({
  imports: [ConfigModule, PrismaModule, WebSocketModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
