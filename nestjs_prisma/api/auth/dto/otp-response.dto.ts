import { ApiProperty } from '@nestjs/swagger';

export class OtpResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 300, description: 'Seconds until the OTP expires' })
  expiresIn: number;
}