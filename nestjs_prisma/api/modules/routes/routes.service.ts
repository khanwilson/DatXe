import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService } from './services/google-maps.service';
import { RouteCacheService } from './services/route-cache.service';

@Injectable()
export class RoutesService {
  private logger = new Logger('RoutesService');

  constructor(
    private googleMapsService: GoogleMapsService,
    private routeCacheService: RouteCacheService,
  ) {}

  async getDirections(
    origin: string,
    destination: string,
    mode: string,
    waypoints?: string[],
    alternatives?: boolean,
  ): Promise<any> {
    let cached = await this.routeCacheService.getDirections(origin, destination, mode);
    if (cached) {
      this.logger.log(`Cache hit: directions ${origin} → ${destination}`);
      return cached;
    }

    const apiResponse = await this.googleMapsService.getDirections(
      origin,
      destination,
      mode,
      waypoints,
      alternatives,
    );

    const transformed = this.transformDirections(apiResponse);
    await this.routeCacheService.setDirections(origin, destination, mode, transformed);

    return transformed;
  }

  async getDistanceMatrix(
    origins: string[],
    destinations: string[],
    mode: string,
  ): Promise<any> {
    let cached = await this.routeCacheService.getDistanceMatrix(origins, destinations);
    if (cached) {
      this.logger.log(`Cache hit: distance-matrix ${origins.length}x${destinations.length}`);
      return cached;
    }

    const apiResponse = await this.googleMapsService.getDistanceMatrix(
      origins,
      destinations,
      mode,
    );

    const transformed = this.transformDistanceMatrix(apiResponse);
    await this.routeCacheService.setDistanceMatrix(origins, destinations, transformed);

    return transformed;
  }

  async getGeocoding(lat: number, lng: number): Promise<any> {
    let cached = await this.routeCacheService.getGeocoding(lat, lng);
    if (cached) {
      this.logger.log(`Cache hit: geocoding ${lat}, ${lng}`);
      return cached;
    }

    const apiResponse = await this.googleMapsService.getGeocoding(lat, lng);
    const transformed = this.transformGeocoding(apiResponse);
    await this.routeCacheService.setGeocoding(lat, lng, transformed);

    return transformed;
  }

  async getPlacesAutocomplete(query: string, language: string): Promise<any> {
    let cached = await this.routeCacheService.getPlacesAutocomplete(query);
    if (cached) {
      this.logger.log(`Cache hit: places-autocomplete "${query}"`);
      return cached;
    }

    const apiResponse = await this.googleMapsService.getPlacesAutocomplete(query, language);
    const transformed = this.transformPlacesAutocomplete(apiResponse);
    await this.routeCacheService.setPlacesAutocomplete(query, transformed);

    return transformed;
  }

  async getPlacesDetails(placeId: string): Promise<any> {
    let cached = await this.routeCacheService.getPlacesDetails(placeId);
    if (cached) {
      this.logger.log(`Cache hit: places-details ${placeId}`);
      return cached;
    }

    const apiResponse = await this.googleMapsService.getPlacesDetails(placeId);
    const transformed = this.transformPlacesDetails(apiResponse);
    await this.routeCacheService.setPlacesDetails(placeId, transformed);

    return transformed;
  }

  private transformDirections(apiResponse: any): any {
    return {
      routes: apiResponse.routes || [],
      summary: {
        totalDistance: apiResponse.routes?.[0]?.legs?.[0]?.distance,
        totalDuration: apiResponse.routes?.[0]?.legs?.[0]?.duration,
      },
    };
  }

  private transformDistanceMatrix(apiResponse: any): any {
    return { matrix: apiResponse.rows || [] };
  }

  private transformGeocoding(apiResponse: any): any {
    const result = apiResponse.results?.[0];
    return {
      address: result?.formatted_address,
      placeId: result?.place_id,
      components: this.extractAddressComponents(result?.address_components),
    };
  }

  private transformPlacesAutocomplete(apiResponse: any): any {
    return {
      predictions: (apiResponse.predictions || []).map((p: any) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.main_text,
        secondaryText: p.secondary_text,
      })),
    };
  }

  private transformPlacesDetails(apiResponse: any): any {
    const result = apiResponse.result;
    return {
      placeId: result?.place_id,
      name: result?.name,
      address: result?.formatted_address,
      location: {
        lat: result?.geometry?.location?.lat,
        lng: result?.geometry?.location?.lng,
      },
      phoneNumber: result?.formatted_phone_number,
      rating: result?.rating,
      photos: (result?.photos || []).map((p: any) => ({ url: p.photo_reference })),
    };
  }

  private extractAddressComponents(components: any[]): any {
    return {
      street: components?.find((c) => c.types.includes('route'))?.long_name,
      district: components?.find((c) => c.types.includes('administrative_area_level_2'))
        ?.long_name,
      city: components?.find((c) => c.types.includes('administrative_area_level_1'))?.long_name,
      country: components?.find((c) => c.types.includes('country'))?.long_name,
    };
  }
}
