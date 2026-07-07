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
import { Server, Socket } from 'socket.io';

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

  constructor(private readonly jwtService: JwtService) {}

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
    } catch {
      this.logger.warn(`Connection rejected (invalid token): ${socket.id}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
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

  emitPaymentSuccess(bookingId: string, bookingStatus: string, paymentStatus: string) {
    this.server.to(`booking:${bookingId}`).emit('booking.payment_success', {
      bookingId,
      bookingStatus,
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
      dropoffAddress: string;
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

  // --- Incoming WS events ---

  @SubscribeMessage('driver.offer_response')
  handleOfferResponse(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { offerId: string; accepted: boolean },
  ) {
    if (!data?.offerId) return;
    this.dispatchService?.resolveOffer(data.offerId, data.accepted === true);
  }
}
