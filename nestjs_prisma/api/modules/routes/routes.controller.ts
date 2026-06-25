import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import {
  GetDirectionsRequestDto,
  GetDistanceMatrixRequestDto,
  GetGeocodingRequestDto,
  GetPlacesAutocompleteQueryDto,
  GetPlacesDetailsParamDto,
} from './dto/routes.dto';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post('directions')
  @HttpCode(HttpStatus.OK)
  async getDirections(@Body() request: GetDirectionsRequestDto) {
    try {
      const data = await this.routesService.getDirections(
        request.origin,
        request.destination,
        request.mode || 'driving',
        request.waypoints,
        request.alternatives,
      );
      return { success: true, data };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }

  @Post('distance-matrix')
  @HttpCode(HttpStatus.OK)
  async getDistanceMatrix(@Body() request: GetDistanceMatrixRequestDto) {
    try {
      const data = await this.routesService.getDistanceMatrix(
        request.origins,
        request.destinations,
        request.mode || 'driving',
      );
      return { success: true, data };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }

  @Post('geocode')
  @HttpCode(HttpStatus.OK)
  async getGeocoding(@Body() request: GetGeocodingRequestDto) {
    try {
      const data = await this.routesService.getGeocoding(request.lat, request.lng);
      return { success: true, data };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }

  @Get('places/autocomplete')
  async getPlacesAutocomplete(@Query() query: GetPlacesAutocompleteQueryDto) {
    try {
      if (!query.query) {
        throw new BadRequestException('query parameter is required');
      }
      const data = await this.routesService.getPlacesAutocomplete(
        query.query,
        query.language || 'vi',
      );
      return { success: true, data };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }

  @Get('places/:placeId')
  async getPlacesDetails(@Param() param: GetPlacesDetailsParamDto) {
    try {
      const data = await this.routesService.getPlacesDetails(param.placeId);
      return { success: true, data };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }
}
