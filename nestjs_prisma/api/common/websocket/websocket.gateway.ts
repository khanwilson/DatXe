import {
  WebSocketGateway as NestWebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../../prisma/prisma.service';

const ROOM_PREFIX = /^(booking|driver|user):/;

@NestWebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
})
export class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebSocketGateway.name);

  // Injected lazily by DispatchService to avoid circular dependency
  private dispatchService?: {
    resolveOffer(offerId: string, accepted: boolean): void;
  };

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server!: Server;

  /** Called by DispatchModule to wire the offer resolver without circular deps */
  registerDispatchService(service: { resolveOffer(offerId: string, accepted: boolean): void }) {
    this.dispatchService = service;
  }

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(socket: Socket) {
    try {
      const token = this.extractToken(socket);
      if (!token) {
        this.logger.warn(`Connection rejected (no token): ${socket.id}`);
        socket.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token);
      socket.data.user = {
        id: payload.sub || payload.id,
        email: payload.email,
        role: payload.role,
        ...payload,
      };
      this.logger.log(`Client connected: ${socket.id} (user: ${socket.data.user.id})`);

      // Auto-join role-scoped rooms. Drivers are addressed by their Driver PK
      // (not user id), so resolve it here; offers are emitted to `driver:${driverPk}`.
      await this.autoJoinRooms(socket);
    } catch {
      this.logger.warn(`Connection rejected (invalid token): ${socket.id}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  /** Join the socket to its role-scoped room so targeted emits reach it. */
  private async autoJoinRooms(socket: Socket) {
    const user = socket.data.user;
    if (!user?.id) return;

    socket.join(`user:${user.id}`);

    if (user.role === UserRole.DRIVER) {
      const driver = await this.prisma.driver.findUnique({
        where: { user_id: user.id },
        select: { id: true },
      });
      if (driver) {
        socket.join(`driver:${driver.id}`);
        socket.data.driverId = driver.id;
      }
    }
  }

  private extractToken(socket: Socket): string | undefined {
    const auth = socket.handshake.auth?.token;
    const query = socket.handshake.query?.token as string | undefined;
    const raw = auth || query;
    if (!raw) return undefined;
    if (raw.startsWith('Bearer ')) return raw.slice(7);
    return raw;
  }

  // --- Room helpers ---

  joinBookingRoom(socket: Socket, bookingId: string) {
    socket.join(`booking:${bookingId}`);
  }

  leaveBookingRoom(socket: Socket, bookingId: string) {
    socket.leave(`booking:${bookingId}`);
  }

  joinDriverRoom(socket: Socket, driverId: string) {
    socket.join(`driver:${driverId}`);
  }

  leaveDriverRoom(socket: Socket, driverId: string) {
    socket.leave(`driver:${driverId}`);
  }

  joinUserRoom(socket: Socket, userId: string) {
    socket.join(`user:${userId}`);
  }

  leaveUserRoom(socket: Socket, userId: string) {
    socket.leave(`user:${userId}`);
  }

  // --- Event emitters ---

  emitBookingStatusChanged(bookingId: string, status: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.status_changed', {
      bookingId,
      status,
    });
  }

  emitDriverLocationUpdated(driverId: string, lat: number, lng: number) {
    this.server.to(`driver:${driverId}`).emit('driver.location_updated', {
      driverId,
      lat,
      lng,
    });
  }

  emitDriverLocationToBooking(
    bookingId: string,
    driverId: string,
    lat: number,
    lng: number,
    heading?: number,
  ) {
    this.server.to(`booking:${bookingId}`).emit('driver.location_updated', {
      driverId,
      lat,
      lng,
      heading: heading ?? null,
    });
  }

  emitTripStatusChanged(
    tripId: string,
    bookingId: string,
    driverId: string,
    status: string,
  ) {
    const payload = { tripId, bookingId, status };
    this.server.to(`booking:${bookingId}`).emit('trip.status_changed', payload);
    this.server.to(`driver:${driverId}`).emit('trip.status_changed', payload);
  }

  emitDispatchOffer(bookingId: string, data: { pickup: string; price: number }) {
    this.server.to(`booking:${bookingId}`).emit('dispatch.offer', {
      bookingId,
      ...data,
    });
  }

  emitDispatchAccepted(bookingId: string, driverId: string) {
    this.server.to(`booking:${bookingId}`).emit('dispatch.accepted', {
      bookingId,
      driverId,
    });
  }

  emitTripStarted(bookingId: string) {
    this.server.to(`booking:${bookingId}`).emit('trip.started', {
      bookingId,
    });
  }

  emitTripCompleted(bookingId: string) {
    this.server.to(`booking:${bookingId}`).emit('trip.completed', {
      bookingId,
    });
  }

  emitPaymentSuccess(bookingId: string, paymentStatus: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.payment_success', {
      bookingId,
      paymentStatus,
    });
  }

  emitPaymentFailed(bookingId: string, responseCode: string, paymentStatus: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.payment_failed', {
      bookingId,
      responseCode,
      paymentStatus,
    });
  }

  /** Emit offer to specific driver */
  emitDriverNewOffer(
    driverId: string,
    payload: {
      offerId: string;
      bookingId: string;
      pickupAddress: string;
      pickupLat: number;
      pickupLng: number;
      dropoffAddress: string;
      dropoffLat: number;
      dropoffLng: number;
      estimatedPrice: number;
      vehicleType: string;
      distanceKm: number;
      expiresAt: string;
    },
  ) {
    this.server.to(`driver:${driverId}`).emit('driver.new_offer', payload);
  }

  /** Emit driver assigned to both booking room and driver room */
  emitBookingDriverAssigned(
    bookingId: string,
    driverId: string,
    payload: {
      bookingId: string;
      tripId: string;
      driver: {
        id: string;
        name: string;
        phone: string;
        vehicleType: string;
        vehiclePlate: string;
        rating: number;
        lat: number;
        lng: number;
      };
    },
  ) {
    this.server.to(`booking:${bookingId}`).emit('booking.driver_assigned', payload);
    this.server.to(`driver:${driverId}`).emit('booking.driver_assigned', payload);
  }

  /** Emit no driver found to booking room */
  emitBookingNoDriverFound(bookingId: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.no_driver_found', {
      bookingId,
      message: 'Không tìm được tài xế. Vui lòng thử lại.',
    });
  }

  emitBookingCancelled(bookingId: string, reason: string, refundStatus: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.cancelled', {
      bookingId,
      reason,
      refundStatus,
    });
  }

  emitBookingDriverCancelled(bookingId: string, driverId: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.driver_cancelled', {
      bookingId,
      driverId,
    });
  }

  emitBookingAwaitingDecision(
    bookingId: string,
    retryCount: number,
    maxRetries: number,
    timeoutMs: number,
  ) {
    this.server.to(`booking:${bookingId}`).emit('booking.awaiting_decision', {
      bookingId,
      retryCount,
      maxRetries,
      timeoutMs,
    });
  }

  emitBookingRefunded(bookingId: string, amount: number, refundStatus: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.refunded', {
      bookingId,
      amount,
      refundStatus,
    });
  }

  // --- Incoming WS events ---

  @SubscribeMessage('driver.offer_response')
  handleOfferResponse(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { offerId: string; accepted: boolean },
  ) {
    if (!data?.offerId) return;
    this.dispatchService?.resolveOffer(data.offerId, data.accepted === true);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: string,
  ) {
    if (await this.canAccessRoom(socket, room)) {
      socket.join(room);
    }
  }

  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() socket: Socket, @MessageBody() room: string) {
    if (typeof room === 'string' && ROOM_PREFIX.test(room)) {
      socket.leave(room);
    }
  }

  /** Validate the socket's user is allowed into the requested room. */
  private async canAccessRoom(socket: Socket, room: string): Promise<boolean> {
    const user = socket.data.user;
    if (!user?.id || typeof room !== 'string' || !ROOM_PREFIX.test(room)) {
      return false;
    }

    const [prefix, id] = room.split(':');

    if (prefix === 'user') {
      return id === user.id;
    }

    if (prefix === 'driver') {
      return id === socket.data.driverId;
    }

    if (prefix === 'booking') {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        select: { customer: { select: { user_id: true } }, driver: { select: { user_id: true } } },
      });
      if (!booking) return false;
      return booking.customer?.user_id === user.id || booking.driver?.user_id === user.id;
    }

    return false;
  }
}
