import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { CreateVnpayPaymentDto } from './dto/create-vnpay-payment.dto';
import { JwtPayload } from '../../auth/types/jwt-payload.type';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('vnpay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    schema: {
      properties: {
        payment_id: { type: 'string' },
        transaction_id: { type: 'string' },
        payment_url: { type: 'string' },
      },
    },
  })
  async createVnpayPayment(
    @Body() dto: CreateVnpayPaymentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentService.createVnpayPayment(dto, user.sub);
  }

  @Get('vnpay/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse()
  async vnpayCallback(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.handleVnpayCallback(query);
    return res.json(result);
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  async getPaymentStatus(@Param('bookingId') bookingId: string) {
    return this.paymentService.getPaymentStatus(bookingId);
  }
}
