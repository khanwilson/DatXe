import {
  Controller,
  Patch,
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
import { TripService } from './trip.service';

@ApiTags('Trips')
@Controller('trips')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Trip cancelled by driver' })
  async cancelTrip(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.tripService.cancelByDriver(id, user.sub);
    return {
      success: true,
      data: result,
    };
  }

  @Patch(':id/driver-arrived')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver arrived at pickup location' })
  async driverArrived(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const trip = await this.tripService.driverArrived(id, user.sub);
    return {
      success: true,
      data: trip,
    };
  }

  @Patch(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Trip started' })
  async startTrip(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const trip = await this.tripService.startTrip(id, user.sub);
    return {
      success: true,
      data: trip,
    };
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Trip completed' })
  async completeTrip(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const trip = await this.tripService.completeTrip(id, user.sub);
    return {
      success: true,
      data: trip,
    };
  }
}
