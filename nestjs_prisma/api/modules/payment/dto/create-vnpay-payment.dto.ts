import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateVnpayPaymentDto {
  @IsString()
  @IsNotEmpty()
  booking_id: string;

  @IsNumber()
  @Min(1000)
  amount: number;

  @IsString()
  @IsNotEmpty()
  order_info: string;

  @IsString()
  @IsNotEmpty()
  client_ip: string;
}
