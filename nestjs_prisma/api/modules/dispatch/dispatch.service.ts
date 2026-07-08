import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingStatus, DriverStatus, OfferStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebSocketGateway } from '../../common/websocket/websocket.gateway';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';

interface DriverLocation {
  lat: number;
  lng: number;
  heading?: number;
  updated_at: string;
}

const DISPATCH_ROUNDS = [
  { radius: 5, roundTimeoutMs: 30_000 },
  { radius: 10, roundTimeoutMs: 30_000 },
  { radius: 15, roundTimeoutMs: 30_000 },
];
const OFFER_TIMEOUT_MS = 15_000;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class DispatchService implements OnModuleInit {
  private readonly logger = new Logger(DispatchService.name);
  private readonly resolverMap = new Map<string, (accepted: boolean) => void>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebSocketGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.gateway.registerDispatchService(this);
  }

  /** Called by WebSocketGateway when driver sends offer_response */
  resolveOffer(offerId: string, accepted: boolean): void {
    const resolver = this.resolverMap.get(offerId);
    if (resolver) {
      this.resolverMap.delete(offerId);
      resolver(accepted);
    }
  }

  async updateDriverLocation(driverId: string, dto: UpdateDriverLocationDto): Promise<void> {
    const location: Prisma.InputJsonValue = {
      lat: dto.lat,
      lng: dto.lng,
      heading: dto.heading,
      updated_at: new Date().toISOString(),
    };

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { current_location: location },
    });

    // Broadcast to booking room if driver has active trip
    const activeTrip = await this.prisma.trip.findFirst({
      where: {
        driver_id: driverId,
        status: {
          in: ['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED', 'IN_PROGRESS'],
        },
      },
      select: { booking_id: true },
    });

    if (activeTrip) {
      this.gateway.emitDriverLocationToBooking(
        activeTrip.booking_id,
        driverId,
        dto.lat,
        dto.lng,
        dto.heading,
      );
    }
  }

  async getDriverLocation(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { current_location: true },
    });

    if (!driver || !driver.current_location) {
      return null;
    }

    const loc = driver.current_location as unknown as DriverLocation;
    return {
      driverId,
      lat: loc.lat,
      lng: loc.lng,
      heading: loc.heading,
      updatedAt: loc.updated_at,
    };
  }

  async runDispatchLoop(bookingId: string): Promise<void> {
    this.logger.log(`Dispatch loop started for booking ${bookingId}`);

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      this.logger.warn(`Booking ${bookingId} not found — aborting dispatch`);
      return;
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.LOOKING_DRIVER },
    });

    const skipSet = new Set<string>();

    for (const round of DISPATCH_ROUNDS) {
      this.logger.log(`Dispatch round radius=${round.radius}km for booking ${bookingId}`);

      const drivers = await this.prisma.driver.findMany({
        where: { status: DriverStatus.ONLINE },
        include: { vehicle: true },
      });

      const driversInRadius = drivers
        .filter(d => d.current_location !== null)
        .map((d) => {
          const loc = d.current_location as unknown as DriverLocation;
          const dist = haversineKm(booking.pickup_lat, booking.pickup_lng, loc.lat, loc.lng);
          return { driver: d, loc, dist };
        })
        .filter((x) => x.dist <= round.radius)
        .sort((a, b) => a.dist - b.dist);

      for (const { driver, loc, dist } of driversInRadius) {
        if (skipSet.has(driver.id)) continue;

        const expiresAt = new Date(Date.now() + OFFER_TIMEOUT_MS);

        const offer = await this.prisma.dispatchOffer.create({
          data: {
            booking_id: bookingId,
            driver_id: driver.id,
            status: OfferStatus.PENDING,
            expired_at: expiresAt,
          },
        });

        this.gateway.emitDriverNewOffer(driver.id, {
          offerId: offer.id,
          bookingId,
          pickupAddress: booking.pickup_address,
          dropoffAddress: booking.dropoff_address,
          estimatedPrice: Number(booking.estimated_price),
          vehicleType: booking.vehicle_type ?? 'xe4cho',
          distanceKm: Math.round(dist * 10) / 10,
          expiresAt: expiresAt.toISOString(),
        });

        const accepted = await this.waitForOffer(offer.id);

        if (accepted) {
          await this.prisma.dispatchOffer.update({
            where: { id: offer.id },
            data: { status: OfferStatus.ACCEPTED, responded_at: new Date() },
          });

          await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.DRIVER_ARRIVING, driver_id: driver.id },
          });

          const trip = await this.prisma.trip.create({
            data: {
              booking_id: bookingId,
              driver_id: driver.id,
              customer_id: booking.customer_id,
              status: 'DRIVER_EN_ROUTE',
              pickup_lat: booking.pickup_lat,
              pickup_lng: booking.pickup_lng,
              dropoff_lat: booking.dropoff_lat,
              dropoff_lng: booking.dropoff_lng,
            },
          });

          this.gateway.emitBookingDriverAssigned(bookingId, driver.id, {
            bookingId,
            tripId: trip.id,
            driver: {
              id: driver.id,
              name: driver.full_name,
              phone: driver.phone,
              vehicleType: driver.vehicle?.type ?? 'CAR',
              vehiclePlate: driver.vehicle?.license_plate ?? '',
              rating: 0,
              lat: loc.lat,
              lng: loc.lng,
            },
          });

          this.logger.log(`Driver ${driver.id} accepted booking ${bookingId}`);
          return;
        } else {
          // Rejected or timed out
          const currentOffer = await this.prisma.dispatchOffer.findUnique({
            where: { id: offer.id },
          });
          const newStatus =
            currentOffer?.status === OfferStatus.PENDING
              ? OfferStatus.EXPIRED
              : OfferStatus.REJECTED;

          await this.prisma.dispatchOffer.update({
            where: { id: offer.id },
            data: { status: newStatus, responded_at: new Date() },
          });

          skipSet.add(driver.id);
          this.logger.log(
            `Driver ${driver.id} ${newStatus.toLowerCase()} offer for booking ${bookingId}`,
          );
        }
      }
    }

    // All rounds exhausted — transition to AWAITING_USER_DECISION instead of NO_DRIVER
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.AWAITING_USER_DECISION },
    });

    const currentBooking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    this.gateway.emitBookingAwaitingDecision(
      bookingId,
      currentBooking?.retry_count ?? 0,
      3,
      30_000,
    );

    // Emit event so BookingCancelService can schedule 30s auto-cancel timeout
    this.eventEmitter.emit('dispatch.exhausted', { bookingId });

    this.logger.log(`No driver found for booking ${bookingId}, awaiting user decision`);
  }

  private waitForOffer(offerId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        this.resolverMap.delete(offerId);
        resolve(false);
      }, OFFER_TIMEOUT_MS);

      this.resolverMap.set(offerId, (accepted: boolean) => {
        clearTimeout(timer);
        resolve(accepted);
      });
    });
  }
}
