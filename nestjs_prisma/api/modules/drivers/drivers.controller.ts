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
    await this.driversService.updateDriverLocation(user.sub, dto);
    return { success: true };
  }

  @Post('online')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver is now online' })
  async goOnline(@CurrentUser() user: JwtPayload) {
    const data = await this.driversService.goOnline(user.sub);
    return { success: true, data };
  }

  @Post('offline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver is now offline' })
  async goOffline(@CurrentUser() user: JwtPayload) {
    const data = await this.driversService.goOffline(user.sub);
    return { success: true, data };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Driver stats for today' })
  async getStats(@CurrentUser() user: JwtPayload) {
    const data = await this.driversService.getDriverStats(user.sub);
    return { success: true, data };
  }

  @Get(':id/location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Driver location' })
  async getDriverLocation(@Param('id') id: string) {
    const location = await this.driversService.getDriverLocation(id);
    return {
      success: true,
      data: location,
    };
  }
}
