import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
}
