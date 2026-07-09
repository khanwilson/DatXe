import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+84912345678' })
  @IsString()
  @Matches(/^\+84\d{9}$/, { message: 'Phone number must be in E.164 format for Vietnam (+84xxxxxxxxx)' })
  phone: string;
}