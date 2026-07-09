import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+84912345678' })
  @IsString()
  @Matches(/^\+84\d{9}$/, { message: 'Phone number must be in E.164 format for Vietnam (+84xxxxxxxxx)' })
  phone: string;

  @ApiProperty({ example: '000000' })
  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 characters' })
  code: string;
}