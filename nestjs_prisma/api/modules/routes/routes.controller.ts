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
      return await this.routesService.getDirections(
        request.origin,
        request.destination,
        request.mode || 'driving',
        request.waypoints,
        request.alternatives,
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }

  @Post('distance-matrix')
  @HttpCode(HttpStatus.OK)
  async getDistanceMatrix(@Body() request: GetDistanceMatrixRequestDto) {
    try {
      return await this.routesService.getDistanceMatrix(
        request.origins,
        request.destinations,
        request.mode || 'driving',
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }

  @Post('geocode')
  @HttpCode(HttpStatus.OK)
  async getGeocoding(@Body() request: GetGeocodingRequestDto) {
    try {
      return await this.routesService.getGeocoding(request.lat, request.lng);
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
      return await this.routesService.getPlacesAutocomplete(
        query.query,
        query.language || 'vi',
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }

  @Get('places/:placeId')
  async getPlacesDetails(@Param() param: GetPlacesDetailsParamDto) {
    try {
      return await this.routesService.getPlacesDetails(param.placeId);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(msg);
    }
  }
}
