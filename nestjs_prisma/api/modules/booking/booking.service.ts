import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }

    const booking = await this.prisma.booking.create({
      data: {
        customer_id: customer.id,
        pickup_lat: dto.pickup_lat,
        pickup_lng: dto.pickup_lng,
        pickup_address: dto.pickup_address,
        dropoff_lat: dto.dropoff_lat,
        dropoff_lng: dto.dropoff_lng,
        dropoff_address: dto.dropoff_address,
        vehicle_type: dto.vehicle_type,
        estimated_price: dto.estimated_price,
        note: dto.note,
        status: BookingStatus.PENDING,
      },
    });

    return booking;
  }

  async findById(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { user_id: userId },
    });
    const driver = await this.prisma.driver.findUnique({
      where: { user_id: userId },
    });

    const isOwner =
      (customer && booking.customer_id === customer.id) ||
      (driver && booking.driver_id === driver.id);

    if (!isOwner) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
