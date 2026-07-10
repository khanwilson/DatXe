import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebSocketGateway } from '../../common/websocket/websocket.gateway';
import { CreateVnpayPaymentDto } from './dto/create-vnpay-payment.dto';
import {
  buildVnpayUrl,
  verifyVnpayCallback,
  formatVnpayDate,
} from './utils/vnpay.util';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly webSocketGateway: WebSocketGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createVnpayPayment(dto: CreateVnpayPaymentDto, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.booking_id },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer || booking.customer_id !== customer.id) {
      throw new BadRequestException('Booking does not belong to this user');
    }

    // Generate unique transaction ref: bookingId-timestamp
    const txnRef = `${booking.id.slice(0, 8)}-${Date.now()}`;

    // Create Payment record in PENDING state
    const payment = await this.prisma.payment.create({
      data: {
        booking_id: dto.booking_id,
        amount: dto.amount,
        method: PaymentMethod.VNPAY,
        status: PaymentStatus.PENDING,
        transaction_id: txnRef, // Store txnRef temporarily, will be overwritten on success
        note: dto.order_info,
      },
    });

    // Build VNPay URL
    const tmnCode = this.configService.get<string>('VNPAY_TMN_CODE', '');
    const hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', '');
    const vnpayUrl = this.configService.get<string>(
      'VNPAY_URL',
      'https://sandbox.vnpayment.vn/paygate',
    );
    const returnUrl = this.configService.get<string>(
      'VNPAY_RETURN_URL',
      'http://localhost:3000/api/payments/vnpay/callback',
    );

    if (!tmnCode || !hashSecret) {
      throw new BadRequestException('VNPay configuration missing');
    }

    const createDate = formatVnpayDate(new Date());
    const paymentUrl = buildVnpayUrl(vnpayUrl, tmnCode, hashSecret, returnUrl, {
      amount: dto.amount,
      txnRef,
      orderInfo: dto.order_info,
      ipAddr: dto.client_ip,
      createDate,
    });

    return {
      payment_id: payment.id,
      transaction_id: txnRef,
      payment_url: paymentUrl,
    };
  }

  async getPaymentStatus(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { booking_id: bookingId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found for this booking');
    }

    return payment;
  }

  async refundPayment(bookingId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { booking_id: bookingId },
    });

    if (!payment) {
      this.logger.warn(`No payment found for booking ${bookingId}`);
      return;
    }

    if (payment.status !== PaymentStatus.SUCCESSFUL) {
      this.logger.warn(`Payment ${payment.id} not in SUCCESSFUL state, cannot refund`);
      return;
    }

    const tmnCode = this.configService.get<string>('VNPAY_TMN_CODE', '');
    const hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', '');

    if (!tmnCode || !hashSecret) {
      this.logger.log(`DEV MODE: Mock refund for payment ${payment.id}`);
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });
      this.webSocketGateway.emitBookingRefunded(
        bookingId,
        Number(payment.amount),
        'REFUNDED',
      );
      return;
    }

    try {
      this.logger.log(`Calling VNPay refund API for payment ${payment.id}`);
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });
      this.webSocketGateway.emitBookingRefunded(
        bookingId,
        Number(payment.amount),
        'REFUNDED',
      );
    } catch (error) {
      this.logger.error(`VNPay refund failed: ${error}`, error);
      throw new BadRequestException('Refund failed');
    }
  }

  async handleVnpayCallback(query: Record<string, string>) {
    const hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', '');

    if (!hashSecret) {
      this.logger.error('VNPay hash secret not configured');
      return { RspCode: '97', Message: 'Invalid Signature' };
    }

    // Verify callback signature
    const { valid, responseCode } = verifyVnpayCallback(hashSecret, query);

    if (!valid) {
      this.logger.warn('Invalid VNPay callback signature');
      return { RspCode: '97', Message: 'Invalid Signature' };
    }

    // Any non-'00' code means the user cancelled or the bank declined. Mark the
    // payment FAILED and notify the app so it can stop waiting immediately
    // instead of relying on a client-side timeout.
    if (responseCode !== '00') {
      this.logger.warn(`VNPay payment failed with code: ${responseCode}`);
      const txnRef = query['vnp_TxnRef'];
      if (txnRef) {
        const payment = await this.prisma.payment.findFirst({
          where: { transaction_id: txnRef },
        });
        if (payment && payment.status === PaymentStatus.PENDING) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
          });
          this.webSocketGateway.emitPaymentFailed(
            payment.booking_id,
            responseCode,
            PaymentStatus.FAILED,
          );
        }
      }
      return { RspCode: '00', Message: 'Confirm Success' };
    }

    try {
      // Extract txnRef from query and find Payment by transaction_id
      const txnRef = query['vnp_TxnRef'];
      const vnpTransactionNo = query['vnp_TransactionNo'];

      if (!txnRef || !vnpTransactionNo) {
        return { RspCode: '97', Message: 'Invalid Callback Data' };
      }

      // Find Payment by transaction_id (which stores txnRef initially)
      const payment = await this.prisma.payment.findFirst({
        where: { transaction_id: txnRef },
        include: { booking: true },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for txnRef: ${txnRef}`);
        return { RspCode: '97', Message: 'Payment Not Found' };
      }

      // Update Payment with success status and real VNPay transaction number
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESSFUL,
          transaction_id: vnpTransactionNo,
          paid_at: new Date(),
        },
      });

      // Payment state lives on the Payment row only — booking.status is left
      // untouched so the dispatch loop owns the booking lifecycle. The app just
      // needs the "paid" signal to switch into LOOKING.
      this.webSocketGateway.emitPaymentSuccess(
        payment.booking_id,
        PaymentStatus.SUCCESSFUL,
      );

      // Emit internal event for DispatchService to start driver search
      this.eventEmitter.emit('payment.success', { bookingId: payment.booking_id });

      this.logger.log(
        `VNPay payment successful: booking=${payment.booking_id}, txnNo=${vnpTransactionNo}`,
      );

      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (error) {
      this.logger.error(`Error handling VNPay callback: ${error}`, error);
      return { RspCode: '99', Message: 'Internal Error' };
    }
  }
}
