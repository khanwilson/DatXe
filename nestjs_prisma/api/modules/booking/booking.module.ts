import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingCancelController } from './booking-cancel.controller';
import { BookingCancelService } from './booking-cancel.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [BookingController, BookingCancelController],
  providers: [BookingService, BookingCancelService],
  exports: [BookingService, BookingCancelService],
})
export class BookingModule {}
