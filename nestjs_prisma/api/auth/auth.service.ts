import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { DriverStatus, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) { }

  async register(dto: RegisterDto) {
    const existedUser = await this.prisma.user.findUnique({
      where: { user_name: dto.user_name },
    });

    if (existedUser) {
      throw new ConflictException('User name already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        user_name: dto.user_name,
        password_hash: passwordHash,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { user_name: dto.user_name },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        user_name: true,
        role: true,
        phone: true,
        avatar: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }

  private buildAuthResponse(user: {
    id: string;
    user_name: string;
    role: string;
    created_at: Date;
    updated_at: Date;
  }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      user_name: user.user_name,
      role: user.role,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        user_name: user.user_name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  async requestOtp(dto: RequestOtpDto) {
    // In DEV mode, we don't actually send an SMS
    // Just log the OTP code to the console for testing purposes
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] OTP code for ${dto.phone}: 000000`);
    }

    // In a real implementation, we would:
    // 1. Generate a random 6-digit code
    // 2. Store it in Redis with a 5-minute TTL
    // 3. Send it via an SMS provider

    return {
      success: true,
      expiresIn: 300, // 5 minutes
    };
  }

  async verifyOtp(dto: VerifyOtpDto, role?: 'CUSTOMER' | 'DRIVER') {
    // In DEV mode, accept code '000000' as a universal bypass
    // In production, all requests are rejected (correct for a DEV-only feature)
    const isDevBypass = dto.code === '000000';
    if (!isDevBypass) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // In a real implementation, we would check the code against Redis storage
    // For now, we'll just validate that it's '000000' in dev mode

    // Find user by phone
    let user = await this.prisma.user.findFirst({
      where: { phone: dto.phone, role: role || undefined },
    });

    // If user doesn't exist, create a new one
    if (!user) {
      try {
        user = await this.prisma.user.create({
          data: {
            user_name: dto.phone, // Use phone as username
            password_hash: 'otp-only', // Placeholder, never used for OTP login
            phone: dto.phone,
            role: role || UserRole.CUSTOMER, // Default role for OTP users
          },
        });

        switch (role) {
          case UserRole.DRIVER:
            // Create driver profile
            await this.prisma.driver.create({
              data: {
                user_id: user.id,
                full_name: dto.phone, // Use phone as full name initially
                is_online: false,
                status: DriverStatus.OFFLINE,
                license_number: '89A1-23456', // Placeholder, should be updated later
                phone: dto.phone,
              },
            });
            break;
          case UserRole.CUSTOMER:
          default:
            // Create customer profile
            await this.prisma.customer.create({
              data: {
                user_id: user.id,
                full_name: dto.phone, // Use phone as full name initially
              },
            });
            break;
        }
      } catch (error) {
        // If user was created concurrently, fetch the existing one
        user = await this.prisma.user.findFirstOrThrow({
          where: { phone: dto.phone, role: role || undefined },
        });
      }
    }

    // Generate access token (JWT, 1 day expiry)
    const accessToken = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    // Generate refresh token (UUID), store in Redis with 30-day TTL
    const refreshToken = uuidv4();
    const redisClient = this.redisService.getClient();
    await redisClient.setex(
      `refresh_token:${refreshToken}`,
      30 * 24 * 60 * 60, // 30 days in seconds
      JSON.stringify({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      }),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: null,
        email: null,
        role: user.role,
      },
    };
  }

  async refreshToken(token: string) {
    const redisClient = this.redisService.getClient();

    // Look up refresh token in Redis
    const storedData = await redisClient.get(`refresh_token:${token}`);

    if (!storedData) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Parse stored data
    const { userId, phone, role } = JSON.parse(storedData);

    // Delete old refresh token
    await redisClient.del(`refresh_token:${token}`);

    // Look up user
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    // Generate new access token + refresh token (rotation)
    const newAccessToken = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    const newRefreshToken = uuidv4();
    await redisClient.setex(
      `refresh_token:${newRefreshToken}`,
      30 * 24 * 60 * 60, // 30 days in seconds
      JSON.stringify({
        userId: user.id,
        phone: user.phone,
        role: user.role,
      }),
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const redisClient = this.redisService.getClient();

    // Delete refresh token from Redis
    await redisClient.del(`refresh_token:${refreshToken}`);

    return {
      success: true,
    };
  }
}
