import {
  Controller,
  Patch,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/types/jwt-payload.type';
import { DriversService } from './drivers.service';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Patch('location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver location updated' })
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateDriverLocationDto,
  ) {
    return this.driversService.updateDriverLocation(user.sub, dto);
  }

  @Post('online')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver is now online' })
  async goOnline(@CurrentUser() user: JwtPayload) {
    return this.driversService.goOnline(user.sub);
  }

  @Post('offline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver is now offline' })
  async goOffline(@CurrentUser() user: JwtPayload) {
    return this.driversService.goOffline(user.sub);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Driver stats for today' })
  async getStats(@CurrentUser() user: JwtPayload) {
    return this.driversService.getDriverStats(user.sub);
  }

  @Get(':id/location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Driver location' })
  async getDriverLocation(@Param('id') id: string) {
    return this.driversService.getDriverLocation(id);
  }
}
