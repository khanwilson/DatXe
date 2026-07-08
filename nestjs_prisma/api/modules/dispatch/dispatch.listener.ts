import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DispatchService } from './dispatch.service';

@Injectable()
export class DispatchListener {
  private readonly logger = new Logger(DispatchListener.name);

  constructor(private readonly dispatchService: DispatchService) {}

  @OnEvent('payment.success')
  async handlePaymentSuccess(payload: { bookingId: string }) {
    this.logger.log(`payment.success received for booking ${payload.bookingId}`);
    this.dispatchService.runDispatchLoop(payload.bookingId).catch((err) => {
      this.logger.error(`Dispatch loop error for booking ${payload.bookingId}: ${err}`, err);
    });
  }

  @OnEvent('booking.retry')
  async handleBookingRetry(payload: { bookingId: string }) {
    this.logger.log(`booking.retry received for booking ${payload.bookingId}`);
    this.dispatchService.runDispatchLoop(payload.bookingId).catch((err) => {
      this.logger.error(`Dispatch loop error for booking ${payload.bookingId}: ${err}`, err);
    });
  }
}
