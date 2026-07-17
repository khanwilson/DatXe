import { Injectable, Logger, OnModuleInit, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BookingStatus, DriverStatus, OfferStatus, TripStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebSocketGateway } from '../../common/websocket/websocket.gateway';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';

interface DriverLocation {
  lat: number;
  lng: number;
  heading?: number;
  updated_at: string;
}

const Drivers_ROUNDS = [
  { radius: 5, roundTimeoutMs: 30_000 },
  { radius: 10, roundTimeoutMs: 30_000 },
  { radius: 15, roundTimeoutMs: 30_000 },
];
const OFFER_TIMEOUT_MS = 15_000;
// How often a round re-queries ONLINE drivers while waiting out its timeout, so a
// driver who toggles online mid-round still gets the offer.
const POLL_INTERVAL_MS = 3_000;
// Widest dispatch radius (km) — used to skip far-away bookings on re-dispatch.
const MAX_DISPATCH_RADIUS_KM = 15;
// A driver is only a live candidate if their last location broadcast is newer
// than this. app_taixe broadcasts every 15s, so 45s tolerates ~3 missed beats
// before we treat a driver as stale (e.g. app killed without going offline).
// The sweep below flips such drivers to OFFLINE; this dispatch-time check is a
// backup in case the sweep is late between ticks.
const DRIVER_STALE_MS = 45_000;
// How often the background sweep flips heartbeat-stale ONLINE drivers to OFFLINE.
// Runs a bit more often than DRIVER_STALE_MS so a ghost is cleared within ~1 tick.
const STALE_SWEEP_INTERVAL_MS = 20_000;

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
export class DriversService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DriversService.name);
  private readonly resolverMap = new Map<string, (accepted: boolean) => void>();
  // Bookings with a dispatch loop currently running. Guards against two loops
  // racing for the same booking (e.g. payment.success and driver.online both
  // firing), which would double-offer and could double-assign.
  private readonly activeLoops = new Set<string>();
  private staleSweepTimer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WebSocketGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.gateway.registerDispatchService(this);
    // Flip heartbeat-stale ONLINE drivers to OFFLINE so BE state reflects reality
    // (e.g. app killed without calling goOffline). setInterval is enough here —
    // no cron engine dependency needed for an idempotent sweep.
    this.staleSweepTimer = setInterval(() => {
      this.sweepStaleDrivers().catch((err) =>
        this.logger.error(`Stale driver sweep failed: ${err}`, err),
      );
    }, STALE_SWEEP_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.staleSweepTimer) clearInterval(this.staleSweepTimer);
  }

  /**
   * Set ONLINE drivers whose last heartbeat (current_location.updated_at) is
   * older than DRIVER_STALE_MS to OFFLINE. Idempotent: a live driver keeps their
   * timestamp fresh, so this only ever catches genuinely-gone drivers.
   */
  private async sweepStaleDrivers(): Promise<void> {
    const onlineDrivers = await this.prisma.driver.findMany({
      where: { status: DriverStatus.ONLINE },
      select: { id: true, current_location: true },
    });

    const staleCutoff = Date.now() - DRIVER_STALE_MS;
    const staleIds = onlineDrivers
      .filter((d) => {
        const loc = d.current_location as unknown as DriverLocation | null;
        // No location yet, or last heartbeat older than the cutoff → stale.
        return !loc?.updated_at || new Date(loc.updated_at).getTime() < staleCutoff;
      })
      .map((d) => d.id);

    if (staleIds.length === 0) return;

    await this.prisma.driver.updateMany({
      where: { id: { in: staleIds } },
      data: { status: DriverStatus.OFFLINE, is_online: false },
    });
    this.logger.log(`Stale sweep: marked ${staleIds.length} driver(s) OFFLINE`);
  }

  /** Called by WebSocketGateway when driver sends offer_response */
  resolveOffer(offerId: string, accepted: boolean): void {
    const resolver = this.resolverMap.get(offerId);
    if (resolver) {
      this.resolverMap.delete(offerId);
      resolver(accepted);
    }
  }

  async updateDriverLocation(driverUserId: string, dto: UpdateDriverLocationDto): Promise<void> {
    const location: Prisma.InputJsonValue = {
      lat: dto.lat,
      lng: dto.lng,
      heading: dto.heading,
      updated_at: new Date().toISOString(),
    };

    // Resolve the Driver PK — trips reference it, and the passenger filters
    // location events by the Driver PK sent in `booking.driver_assigned`.
    const driver = await this.prisma.driver.update({
      where: { user_id: driverUserId },
      data: { current_location: location },
      select: { id: true },
    });

    // Broadcast to booking room if driver has active trip
    const activeTrip = await this.prisma.trip.findFirst({
      where: {
        driver_id: driver.id,
        status: {
          in: [TripStatus.DRIVER_EN_ROUTE, TripStatus.DRIVER_ARRIVED, TripStatus.IN_PROGRESS],
        },
      },
      select: { booking_id: true },
    });

    if (activeTrip) {
      this.gateway.emitDriverLocationToBooking(
        activeTrip.booking_id,
        driver.id,
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async runDriversLoop(bookingId: string): Promise<void> {
    // Concurrency guard: payment.success and driver.online can both trigger a
    // loop for the same booking. Only one may run at a time.
    if (this.activeLoops.has(bookingId)) {
      this.logger.log(`Dispatch loop already active for booking ${bookingId}, skipping`);
      return;
    }
    this.activeLoops.add(bookingId);
    try {
      await this.runDriversLoopInner(bookingId);
    } finally {
      this.activeLoops.delete(bookingId);
    }
  }

  private async runDriversLoopInner(bookingId: string): Promise<void> {
    this.logger.log(`Driver dispatch loop started for booking ${bookingId}`);

    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      this.logger.warn(`Booking ${bookingId} not found — aborting Driver dispatch`);
      return;
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.LOOKING_DRIVER },
    });

    const skipSet = new Set<string>();

    for (const round of Drivers_ROUNDS) {
      this.logger.log(`Driver dispatch round radius=${round.radius}km for booking ${bookingId}`);

      // Keep this round alive for its whole timeout, re-querying ONLINE drivers
      // periodically. This is what lets a driver who toggles online mid-round
      // still receive the offer, instead of the loop finishing in milliseconds.
      const roundDeadline = Date.now() + round.roundTimeoutMs;

      while (Date.now() < roundDeadline) {
        // Bail out if the booking is no longer looking for a driver (cancelled
        // by user, or assigned by another path).
        const fresh = await this.prisma.booking.findUnique({
          where: { id: bookingId },
          select: { status: true },
        });
        if (!fresh || fresh.status !== BookingStatus.LOOKING_DRIVER) {
          this.logger.log(
            `Booking ${bookingId} no longer LOOKING_DRIVER (${fresh?.status ?? 'gone'}), stopping dispatch`,
          );
          return;
        }

        const drivers = await this.prisma.driver.findMany({
          where: { status: DriverStatus.ONLINE },
          include: { vehicle: true },
        });

        const staleCutoff = Date.now() - DRIVER_STALE_MS;

        const driversInRadius = drivers
          .filter((d) => d.current_location !== null)
          .map((d) => {
            const loc = d.current_location as unknown as DriverLocation;
            const dist = haversineKm(booking.pickup_lat, booking.pickup_lng, loc.lat, loc.lng);
            return { driver: d, loc, dist };
          })
          // Skip ghost drivers: ONLINE in DB but no recent heartbeat (app killed
          // without going offline). Their last location predates the cutoff.
          .filter((x) => new Date(x.loc.updated_at).getTime() >= staleCutoff)
          .filter((x) => x.dist <= round.radius && !skipSet.has(x.driver.id))
          .sort((a, b) => a.dist - b.dist);

        if (driversInRadius.length === 0) {
          // No candidate right now — wait a beat and re-query until the round
          // deadline, so a late-online driver still gets picked up.
          await this.sleep(POLL_INTERVAL_MS);
          continue;
        }

        // Offer to the nearest candidate only; on reject/timeout, skip and the
        // next while-iteration re-queries and picks the next nearest.
        const { driver, loc, dist } = driversInRadius[0];

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
          pickupLat: booking.pickup_lat,
          pickupLng: booking.pickup_lng,
          dropoffAddress: booking.dropoff_address,
          dropoffLat: booking.dropoff_lat,
          dropoffLng: booking.dropoff_lng,
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

          // Move the passenger out of FINDING: driver_assigned carries who, but the
          // trip status feed is what the passenger's UI transitions on.
          this.gateway.emitTripStatusChanged(
            trip.id,
            bookingId,
            driver.id,
            TripStatus.DRIVER_EN_ROUTE,
          );

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

    // All rounds exhausted. BookingCancelService owns the decision: either
    // transition to AWAITING_USER_DECISION (offer continue/cancel) or, once
    // retries are used up, auto-cancel + refund. Keep that logic in one place.
    this.eventEmitter.emit('dispatch.exhausted', { bookingId });

    this.logger.log(`No driver found for booking ${bookingId}, handing off to decision handler`);
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

  async goOnline(driverUserId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { user_id: driverUserId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const updatedDriver = await this.prisma.driver.update({
      where: { user_id: driverUserId },
      data: {
        status: DriverStatus.ONLINE,
        is_online: true,
      },
      select: {
        id: true,
        full_name: true,
        status: true,
        is_online: true,
      },
    });

    // A driver just became available — kick any bookings still waiting for one.
    this.eventEmitter.emit('driver.online', { driverId: updatedDriver.id });

    return updatedDriver;
  }

  // Re-dispatch bookings that are still waiting for a driver when one comes
  // online. Without this, a booking whose initial dispatch loop already ended
  // (no drivers were online yet) would never reach a driver who toggles on a
  // few seconds later.
  async redispatchWaitingBookings(driverId: string): Promise<void> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: { current_location: true },
    });
    const loc = driver?.current_location as unknown as DriverLocation | null;

    const waiting = await this.prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.LOOKING_DRIVER, BookingStatus.AWAITING_USER_DECISION],
        },
      },
      select: { id: true, pickup_lat: true, pickup_lng: true },
    });

    for (const booking of waiting) {
      // Best-effort distance filter: skip bookings clearly out of range when we
      // know where the driver is. If location isn't set yet, let the loop's own
      // radius filter decide once the driver starts broadcasting.
      if (loc) {
        const dist = haversineKm(booking.pickup_lat, booking.pickup_lng, loc.lat, loc.lng);
        if (dist > MAX_DISPATCH_RADIUS_KM) continue;
      }
      if (this.activeLoops.has(booking.id)) continue;

      this.logger.log(`Driver ${driverId} online — re-dispatching booking ${booking.id}`);
      this.runDriversLoop(booking.id).catch((err) => {
        this.logger.error(`Re-dispatch loop error for booking ${booking.id}: ${err}`, err);
      });
    }
  }

  async goOffline(driverUserId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { user_id: driverUserId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const updatedDriver = await this.prisma.driver.update({
      where: { user_id: driverUserId },
      data: {
        status: DriverStatus.OFFLINE,
        is_online: false,
      },
      select: {
        id: true,
        full_name: true,
        status: true,
        is_online: true,
      },
    });

    return updatedDriver;
  }

  async getDriverStats(driverUserId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { user_id: driverUserId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Calculate start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Query completed bookings for today
    const completedBookings = await this.prisma.booking.findMany({
      where: {
        driver_id: driver.id,
        status: BookingStatus.COMPLETED,
        updated_at: {
          gte: today,
        },
      },
      select: {
        final_price: true,
      },
    });

    // Calculate stats
    const tripsToday = completedBookings.length;
    const earningsToday = completedBookings.reduce((sum, booking) => {
      return sum + Number(booking.final_price ?? 0);
    }, 0);

    return {
      isOnline: driver.is_online,
      tripsToday,
      earningsToday,
    };
  }
}
