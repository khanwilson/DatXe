import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoongConfig {
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
    this.apiKey = this.configService.get<string>('GOONG_API_KEY') || '';
    this.baseUrl = this.configService.get<string>(
      'GOONG_BASE_URL',
      'https://rsapi.goong.io',
    );

    if (!this.apiKey) {
      throw new Error('GOONG_API_KEY is not configured');
    }
  }

  getDirectionsUrl(): string {
    return `${this.baseUrl}/Direction`;
  }

  getDistanceMatrixUrl(): string {
    return `${this.baseUrl}/DistanceMatrix`;
  }

  getGeocodingUrl(): string {
    return `${this.baseUrl}/Geocode`;
  }

  getPlacesAutocompleteUrl(): string {
    return `${this.baseUrl}/Place/AutoComplete`;
  }

  getPlacesDetailsUrl(): string {
    return `${this.baseUrl}/Place/Detail`;
  }
}
