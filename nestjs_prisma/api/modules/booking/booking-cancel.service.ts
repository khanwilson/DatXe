import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebSocketGateway } from '../../common/websocket/websocket.gateway';
import { PaymentService } from '../payment/payment.service';

const MAX_RETRIES = 3;
const DECISION_TIMEOUT_MS = 30_000;

@Injectable()
export class BookingCancelService {
  private readonly logger = new Logger(BookingCancelService.name);
  private readonly pendingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WebSocketGateway,
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('dispatch.exhausted')
  async handleDispatchExhausted(payload: { bookingId: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: payload.bookingId },
    });
    if (!booking) {
      this.logger.warn(`Booking ${payload.bookingId} not found on dispatch exhausted`);
      return;
    }

    // Retries used up: no point asking the user again. Cancel + refund and tell
    // them every driver is busy.
    if (booking.retry_count >= MAX_RETRIES) {
      this.logger.log(`Dispatch exhausted for ${payload.bookingId}, retries used up — cancelling + refunding`);
      const refundStatus = await this.cancelAndRefund(payload.bookingId, 'ALL_DRIVERS_BUSY');
      this.wsGateway.emitBookingCancelled(payload.bookingId, 'ALL_DRIVERS_BUSY', refundStatus);
      this.logger.log(
        `Emitted booking.cancelled for ${payload.bookingId} (reason=ALL_DRIVERS_BUSY, refund=${refundStatus})`,
      );
      this.clearTimeout(payload.bookingId);
      return;
    }

    // Retries left: offer the user continue/cancel and arm the 30s auto-cancel.
    this.logger.log(`Dispatch exhausted for ${payload.bookingId}, awaiting user decision`);
    await this.transitionToAwaitingDecision(payload.bookingId);
  }

  /**
   * Cancel a booking and refund it if a successful payment exists. Returns the
   * refund status string for the WS payload. Shared by user-cancel, auto-cancel,
   * and all-drivers-busy paths.
   */
  private async cancelAndRefund(bookingId: string, reason: string): Promise<string> {
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED_BY_USER,
        cancelled_at: new Date(),
        cancel_reason: reason,
      },
    });

    const payment = await this.prisma.payment.findUnique({
      where: { booking_id: bookingId },
    });

    if (payment?.status === PaymentStatus.SUCCESSFUL) {
      await this.paymentService.refundPayment(bookingId);
      return 'REFUNDED';
    }
    return 'NO_REFUND_NEEDED';
  }

  @OnEvent('trip.driver_cancelled')
  async handleDriverCancelled(payload: { bookingId: string }) {
    this.logger.log(`Driver cancelled for booking ${payload.bookingId}, transitioning to AWAITING_USER_DECISION`);
    await this.transitionToAwaitingDecision(payload.bookingId);
  }

  async cancelByUser(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // customer_id references Customer.id, but the JWT subject is User.id — resolve.
    const customer = await this.prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer || booking.customer_id !== customer.id) {
      throw new BadRequestException('Not authorized to cancel this booking');
    }

    const allowedStatuses: BookingStatus[] = [
      BookingStatus.LOOKING_DRIVER,
      BookingStatus.DRIVER_ARRIVING,
      BookingStatus.AWAITING_USER_DECISION,
    ];

    if (!allowedStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Cannot cancel booking in status ${booking.status}`,
      );
    }

    const refundStatus = await this.cancelAndRefund(bookingId, 'USER_CANCELLED');

    this.wsGateway.emitBookingCancelled(bookingId, 'USER_CANCELLED', refundStatus);
    this.logger.log(
      `Emitted booking.cancelled for ${bookingId} (reason=USER_CANCELLED, refund=${refundStatus})`,
    );

    this.clearTimeout(bookingId);

    return {
      bookingId,
      status: 'CANCELLED_BY_USER',
      refundStatus,
    };
  }

  async retryBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // customer_id references Customer.id, but the JWT subject is User.id — resolve.
    const customer = await this.prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer || booking.customer_id !== customer.id) {
      throw new BadRequestException('Not authorized to retry this booking');
    }

    const allowedStatuses: BookingStatus[] = [
      BookingStatus.AWAITING_USER_DECISION,
      BookingStatus.CANCELLED_BY_DRIVER,
    ];

    if (!allowedStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Cannot retry booking in status ${booking.status}`,
      );
    }

    if (booking.retry_count >= MAX_RETRIES) {
      throw new BadRequestException('MAX_RETRIES_EXCEEDED');
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.LOOKING_DRIVER,
        retry_count: booking.retry_count + 1,
        driver_id: null,
      },
    });

    this.clearTimeout(bookingId);

    this.logger.log(
      `Booking ${bookingId} retry #${booking.retry_count + 1}, restarting dispatch`,
    );

    // Emit event to trigger dispatch loop again
    this.eventEmitter.emit('booking.retry', { bookingId });

    return {
      bookingId,
      status: 'LOOKING_DRIVER',
      retryCount: booking.retry_count + 1,
    };
  }

  async transitionToAwaitingDecision(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      this.logger.warn(`Booking ${bookingId} not found for awaiting decision`);
      return;
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.AWAITING_USER_DECISION },
    });

    this.wsGateway.emitBookingAwaitingDecision(
      bookingId,
      booking.retry_count,
      MAX_RETRIES,
      DECISION_TIMEOUT_MS,
    );

    this.scheduleAutoCancel(bookingId);
  }

  private scheduleAutoCancel(bookingId: string) {
    this.clearTimeout(bookingId);

    const timer = setTimeout(async () => {
      try {
        const booking = await this.prisma.booking.findUnique({
          where: { id: bookingId },
        });

        if (booking?.status === BookingStatus.AWAITING_USER_DECISION) {
          this.logger.log(`Auto-cancelling booking ${bookingId} after 30s timeout`);
          const refundStatus = await this.cancelAndRefund(bookingId, 'AUTO_TIMEOUT');
          this.wsGateway.emitBookingCancelled(bookingId, 'AUTO_TIMEOUT', refundStatus);
          this.logger.log(
            `Emitted booking.cancelled for ${bookingId} (reason=AUTO_TIMEOUT, refund=${refundStatus})`,
          );
        }
      } catch (error) {
        this.logger.error(`Auto-cancel failed for ${bookingId}: ${error}`, error);
      } finally {
        this.pendingTimeouts.delete(bookingId);
      }
    }, DECISION_TIMEOUT_MS);

    this.pendingTimeouts.set(bookingId, timer);
  }

  private clearTimeout(bookingId: string) {
    const timer = this.pendingTimeouts.get(bookingId);
    if (timer) {
      clearTimeout(timer);
      this.pendingTimeouts.delete(bookingId);
    }
  }
}
