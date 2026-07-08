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
    this.logger.log(`Dispatch exhausted for booking ${payload.bookingId}, starting 30s timeout`);
    await this.scheduleAutoCancel(payload.bookingId);
  }

  @OnEvent('trip.driver_cancelled')
  async handleDriverCancelled(payload: { bookingId: string }) {
    this.logger.log(`Driver cancelled for booking ${payload.bookingId}, transitioning to AWAITING_USER_DECISION`);
    await this.transitionToAwaitingDecision(payload.bookingId);
  }

  async cancelByUser(bookingId: string, customerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer_id !== customerId) {
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

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED_BY_USER,
        cancelled_at: new Date(),
        cancel_reason: 'USER_CANCELLED',
      },
    });

    const payment = await this.prisma.payment.findUnique({
      where: { booking_id: bookingId },
    });

    let refundStatus = 'NO_REFUND_NEEDED';
    if (payment?.status === PaymentStatus.SUCCESSFUL) {
      await this.paymentService.refundPayment(bookingId);
      refundStatus = 'REFUNDED';
    }

    this.wsGateway.emitBookingCancelled(bookingId, 'USER_CANCELLED', refundStatus);

    this.clearTimeout(bookingId);

    return {
      bookingId,
      status: 'CANCELLED_BY_USER',
      refundStatus,
    };
  }

  async retryBooking(bookingId: string, customerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer_id !== customerId) {
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

          await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: BookingStatus.CANCELLED_BY_USER,
              cancelled_at: new Date(),
              cancel_reason: 'AUTO_TIMEOUT',
            },
          });

          const payment = await this.prisma.payment.findUnique({
            where: { booking_id: bookingId },
          });

          let refundStatus = 'NO_REFUND_NEEDED';
          if (payment?.status === PaymentStatus.SUCCESSFUL) {
            await this.paymentService.refundPayment(bookingId);
            refundStatus = 'REFUNDED';
          }

          this.wsGateway.emitBookingCancelled(bookingId, 'AUTO_TIMEOUT', refundStatus);
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
