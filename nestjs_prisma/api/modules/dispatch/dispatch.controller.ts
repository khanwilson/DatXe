import {
  Controller,
  Patch,
  Body,
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
}
