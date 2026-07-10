import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingStatus, TripStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebSocketGateway } from '../../common/websocket/websocket.gateway';

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WebSocketGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Callers pass the authenticated User id (JWT `sub`), but trips reference the
  // Driver PK. Resolve it here so ownership checks compare like-for-like.
  private async resolveDriverId(userId: string): Promise<string> {
    const driver = await this.prisma.driver.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    if (!driver) {
      throw new ForbiddenException('Driver profile not found');
    }
    return driver.id;
  }

  async cancelByDriver(tripId: string, userId: string) {
    const driverId = await this.resolveDriverId(userId);

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { booking: true },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driver_id !== driverId) {
      throw new ForbiddenException('Not authorized to cancel this trip');
    }

    if (trip.status !== TripStatus.DRIVER_EN_ROUTE) {
      throw new BadRequestException(
        `Cannot cancel trip in status ${trip.status}`,
      );
    }

    await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.CANCELLED,
        cancelled_at: new Date(),
        cancel_reason: 'DRIVER_CANCELLED',
      },
    });

    await this.prisma.booking.update({
      where: { id: trip.booking_id },
      data: {
        status: BookingStatus.CANCELLED_BY_DRIVER,
        driver_id: null,
      },
    });

    this.wsGateway.emitBookingDriverCancelled(trip.booking_id, driverId);

    // Emit event to trigger AWAITING_USER_DECISION transition
    this.eventEmitter.emit('trip.driver_cancelled', { bookingId: trip.booking_id });

    return {
      tripId,
      status: TripStatus.CANCELLED,
      bookingStatus: BookingStatus.CANCELLED_BY_DRIVER,
    };
  }

  async driverArrived(tripId: string, userId: string) {
    const driverId = await this.resolveDriverId(userId);
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driver_id !== driverId) {
      throw new ForbiddenException('Not authorized to update this trip');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.DRIVER_ARRIVED,
      },
    });

    await this.prisma.booking.update({
      where: { id: trip.booking_id },
      data: {
        status: BookingStatus.DRIVER_ARRIVED,
      },
    });

    this.wsGateway.emitTripStatusChanged(
      tripId,
      trip.booking_id,
      driverId,
      TripStatus.DRIVER_ARRIVED,
    );

    return updatedTrip;
  }

  async startTrip(tripId: string, userId: string) {
    const driverId = await this.resolveDriverId(userId);
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driver_id !== driverId) {
      throw new ForbiddenException('Not authorized to update this trip');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.IN_PROGRESS,
        started_at: new Date(),
      },
    });

    await this.prisma.booking.update({
      where: { id: trip.booking_id },
      data: {
        status: BookingStatus.IN_PROGRESS,
      },
    });

    this.wsGateway.emitTripStatusChanged(
      tripId,
      trip.booking_id,
      driverId,
      TripStatus.IN_PROGRESS,
    );

    return updatedTrip;
  }

  async completeTrip(tripId: string, userId: string) {
    const driverId = await this.resolveDriverId(userId);
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driver_id !== driverId) {
      throw new ForbiddenException('Not authorized to update this trip');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        completed_at: new Date(),
      },
    });

    await this.prisma.booking.update({
      where: { id: trip.booking_id },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });

    this.wsGateway.emitTripStatusChanged(
      tripId,
      trip.booking_id,
      driverId,
      TripStatus.COMPLETED,
    );

    return updatedTrip;
  }
}
