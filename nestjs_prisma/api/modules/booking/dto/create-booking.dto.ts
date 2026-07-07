import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  pickup_lat: number;

  @IsNumber()
  pickup_lng: number;

  @IsString()
  @IsNotEmpty()
  pickup_address: string;

  @IsNumber()
  dropoff_lat: number;

  @IsNumber()
  dropoff_lng: number;

  @IsString()
  @IsNotEmpty()
  dropoff_address: string;

  @IsString()
  @IsNotEmpty()
  vehicle_type: string;

  @IsNumber()
  @Min(0)
  estimated_price: number;

  @IsString()
  @IsOptional()
  note?: string;
}
