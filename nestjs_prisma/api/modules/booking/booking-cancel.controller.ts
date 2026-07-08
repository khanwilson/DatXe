import {
  Controller,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/types/jwt-payload.type';
import { BookingCancelService } from './booking-cancel.service';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingCancelController {
  constructor(private readonly bookingCancelService: BookingCancelService) {}

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Booking cancelled by user' })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.bookingCancelService.cancelByUser(id, user.sub);
    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Booking retry requested' })
  async retryBooking(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.bookingCancelService.retryBooking(id, user.sub);
    return {
      success: true,
      data: result,
    };
  }
}
