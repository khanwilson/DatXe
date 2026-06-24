import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      [key: string]: any;
    };
  };
}

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const socket: Socket = context.switchToWs().getClient();
    const token = this.extractToken(socket);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = this.jwtService.verify(token);
      socket.data.user = {
        id: payload.sub || payload.id,
        email: payload.email,
        role: payload.role,
        ...payload,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(socket: Socket): string | undefined {
    const auth = socket.handshake.auth?.token;
    const query = socket.handshake.query?.token as string | undefined;

    const raw = auth || query;
    if (!raw) return undefined;

    if (raw.startsWith('Bearer ')) {
      return raw.slice(7);
    }
    return raw;
  }
}
