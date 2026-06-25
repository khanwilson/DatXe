import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleMapsConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly timeout: number = 10000;
  readonly retryAttempts: number = 2;
  readonly cache = {
    directionsTTL: 900,
    distanceMatrixTTL: 900,
    geocodingTTL: 3600,
    placesAutocompleteTTL: 300,
    placesDetailsTTL: 3600,
  };

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    this.baseUrl = this.configService.get<string>(
      'GOOGLE_MAPS_BASE_URL',
      'https://maps.googleapis.com/maps/api',
    );

    if (!this.apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured');
    }
  }

  getDirectionsUrl(): string {
    return `${this.baseUrl}/directions/json`;
  }

  getDistanceMatrixUrl(): string {
    return `${this.baseUrl}/distancematrix/json`;
  }

  getGeocodingUrl(): string {
    return `${this.baseUrl}/geocode/json`;
  }

  getPlacesAutocompleteUrl(): string {
    return `${this.baseUrl}/place/autocomplete/json`;
  }

  getPlacesDetailsUrl(): string {
    return `${this.baseUrl}/place/details/json`;
  }
}
