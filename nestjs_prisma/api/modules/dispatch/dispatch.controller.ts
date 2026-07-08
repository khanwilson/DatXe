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
import { DispatchService } from './dispatch.service';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';

@ApiTags('Drivers')
@Controller('drivers')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Patch('location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver location updated' })
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateDriverLocationDto,
  ) {
    await this.dispatchService.updateDriverLocation(user.sub, dto);
    return { success: true };
  }

  @Post('online')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver is now online' })
  async goOnline(@CurrentUser() user: JwtPayload) {
    const data = await this.dispatchService.goOnline(user.sub);
    return { success: true, data };
  }

  @Post('offline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Driver is now offline' })
  async goOffline(@CurrentUser() user: JwtPayload) {
    const data = await this.dispatchService.goOffline(user.sub);
    return { success: true, data };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Driver stats for today' })
  async getStats(@CurrentUser() user: JwtPayload) {
    const data = await this.dispatchService.getDriverStats(user.sub);
    return { success: true, data };
  }

  @Get(':id/location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Driver location' })
  async getDriverLocation(@Param('id') id: string) {
    const location = await this.dispatchService.getDriverLocation(id);
    return {
      success: true,
      data: location,
    };
  }
}
