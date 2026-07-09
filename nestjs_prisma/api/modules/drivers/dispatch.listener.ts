import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DriversService } from './drivers.service';

@Injectable()
export class DriversListener {
  private readonly logger = new Logger(DriversListener.name);

  constructor(private readonly DriversService: DriversService) {}

  @OnEvent('payment.success')
  async handlePaymentSuccess(payload: { bookingId: string }) {
    this.logger.log(`payment.success received for booking ${payload.bookingId}`);
    this.DriversService.runDriversLoop(payload.bookingId).catch((err) => {
      this.logger.error(`Driver dispatch loop error for booking ${payload.bookingId}: ${err}`, err);
    });
  }

  @OnEvent('booking.retry')
  async handleBookingRetry(payload: { bookingId: string }) {
    this.logger.log(`booking.retry received for booking ${payload.bookingId}`);
    this.DriversService.runDriversLoop(payload.bookingId).catch((err) => {
      this.logger.error(`Driver dispatch loop error for booking ${payload.bookingId}: ${err}`, err);
    });
  }
}
