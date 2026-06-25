import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GoogleMapsConfig } from '../../../config/google-maps.config';

@Injectable()
export class GoogleMapsService {
  private logger = new Logger('GoogleMapsService');

  constructor(private config: GoogleMapsConfig) {}

  async getDirections(
    origin: string,
    destination: string,
    mode: string = 'driving',
    waypoints?: string[],
    alternatives: boolean = false,
  ): Promise<any> {
    const params = {
      origin,
      destination,
      mode,
      key: this.config.apiKey,
      ...(waypoints && { waypoints: waypoints.join('|') }),
      alternatives,
    };

    return this.callGoogleApi(this.config.getDirectionsUrl(), params);
  }

  async getDistanceMatrix(
    origins: string[],
    destinations: string[],
    mode: string = 'driving',
  ): Promise<any> {
    const params = {
      origins: origins.join('|'),
      destinations: destinations.join('|'),
      mode,
      key: this.config.apiKey,
    };

    return this.callGoogleApi(this.config.getDistanceMatrixUrl(), params);
  }

  async getGeocoding(lat: number, lng: number): Promise<any> {
    const params = {
      latlng: `${lat},${lng}`,
      key: this.config.apiKey,
      language: 'vi',
    };

    return this.callGoogleApi(this.config.getGeocodingUrl(), params);
  }

  async getPlacesAutocomplete(query: string, language: string = 'vi'): Promise<any> {
    const params = {
      input: query,
      key: this.config.apiKey,
      language,
    };

    return this.callGoogleApi(this.config.getPlacesAutocompleteUrl(), params);
  }

  async getPlacesDetails(placeId: string): Promise<any> {
    const params = {
      place_id: placeId,
      key: this.config.apiKey,
      language: 'vi',
    };

    return this.callGoogleApi(this.config.getPlacesDetailsUrl(), params);
  }

  private async callGoogleApi(url: string, params: any, attempt: number = 1): Promise<any> {
    try {
      const response = await axios.get(url, {
        params,
        timeout: this.config.timeout,
      });

      if (response.data.status === 'ZERO_RESULTS') {
        return { status: 'ZERO_RESULTS', data: null };
      }

      if (response.data.status !== 'OK') {
        throw new Error(`Google API error: ${response.data.status}`);
      }

      return response.data;
    } catch (error: unknown) {
      if (attempt < this.config.retryAttempts && this.isRetryableError(error)) {
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(
          `Retrying Google API call (attempt ${attempt + 1}/${this.config.retryAttempts}) after ${delay}ms`,
        );
        // eslint-disable-next-line no-undef
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.callGoogleApi(url, params, attempt + 1);
      }

      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Google API call failed: ${errorMsg}`);
      throw error;
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      return (
        error.code === 'ECONNABORTED' ||
        error.code === 'ETIMEDOUT' ||
        (error.response?.status || 0) >= 500
      );
    }
    return false;
  }
}
