import { ApiProperty } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty()
  role: string;
}

export class OtpVerifyResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}