import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateBookingDto) {
    const booking = await this.prisma.booking.create({
      data: {
        customer_id: customerId,
        pickup_lat: dto.pickup_lat,
        pickup_lng: dto.pickup_lng,
        pickup_address: dto.pickup_address,
        dropoff_lat: dto.dropoff_lat,
        dropoff_lng: dto.dropoff_lng,
        dropoff_address: dto.dropoff_address,
        vehicle_type: dto.vehicle_type,
        estimated_price: dto.estimated_price,
        note: dto.note,
        status: 'PENDING',
      },
    });

    return booking;
  }

  async findById(id: string, customerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer_id !== customerId && booking.driver_id !== customerId) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
