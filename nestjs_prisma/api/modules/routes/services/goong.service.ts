import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GoongConfig } from '../../../config/goong.config';

@Injectable()
export class GoongService {
  private logger = new Logger('GoongService');

  constructor(private config: GoongConfig) {}

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
      vehicle: this.mapVehicle(mode),
      api_key: this.config.apiKey,
      ...(waypoints && waypoints.length > 0 && { waypoints: waypoints.join(';') }),
      alternatives,
    };

    const data = await this.callGoongApi(this.config.getDirectionsUrl(), params);
    return this.normalizeDirections(data);
  }

  async getDistanceMatrix(
    origins: string[],
    destinations: string[],
    mode: string = 'driving',
  ): Promise<any> {
    const params = {
      origins: origins.join('|'),
      destinations: destinations.join('|'),
      vehicle: this.mapVehicle(mode),
      api_key: this.config.apiKey,
    };

    const data = await this.callGoongApi(this.config.getDistanceMatrixUrl(), params);
    return this.normalizeDistanceMatrix(data);
  }

  async getGeocoding(lat: number, lng: number): Promise<any> {
    const params = {
      latlng: `${lat},${lng}`,
      api_key: this.config.apiKey,
    };

    const data = await this.callGoongApi(this.config.getGeocodingUrl(), params);
    return this.normalizeGeocoding(data);
  }

  async getPlacesAutocomplete(query: string, _language: string = 'vi'): Promise<any> {
    const params = {
      input: query,
      api_key: this.config.apiKey,
    };

    const data = await this.callGoongApi(this.config.getPlacesAutocompleteUrl(), params);
    return this.normalizeAutocomplete(data);
  }

  async getPlacesDetails(placeId: string): Promise<any> {
    const params = {
      place_id: placeId,
      api_key: this.config.apiKey,
    };

    const data = await this.callGoongApi(this.config.getPlacesDetailsUrl(), params);
    return this.normalizePlaceDetails(data);
  }

  private mapVehicle(mode: string): string {
    switch (mode) {
      case 'driving':
        return 'car';
      case 'walking':
        return 'bike';
      case 'transit':
        throw new Error(
          "Goong does not support 'transit' mode; use 'driving' or 'walking'",
        );
      default:
        throw new Error(`Unsupported travel mode: ${mode}`);
    }
  }

  private normalizeDirections(data: any): any {
    return { routes: data.routes || [] };
  }

  private normalizeDistanceMatrix(data: any): any {
    return { rows: data.rows || [] };
  }

  private normalizeGeocoding(data: any): any {
    const results = (data.results || []).map((r: any) => ({
      formatted_address: r.formatted_address,
      place_id: r.place_id,
      geometry: r.geometry,
      address_components: this.buildAddressComponents(r),
    }));
    return { results };
  }

  private normalizeAutocomplete(data: any): any {
    const predictions = (data.predictions || []).map((p: any) => ({
      place_id: p.place_id,
      description: p.description,
      main_text: p.structured_formatting?.main_text,
      secondary_text: p.structured_formatting?.secondary_text,
    }));
    return { predictions };
  }

  private normalizePlaceDetails(data: any): any {
    const result = data.result;
    if (!result) {
      return { result: null };
    }
    return {
      result: {
        place_id: result.place_id,
        name: result.name,
        formatted_address: result.formatted_address,
        geometry: result.geometry,
        formatted_phone_number: result.formatted_phone_number,
        rating: result.rating,
        photos: result.photos || [],
      },
    };
  }

  private buildAddressComponents(result: any): any[] {
    const compound = result.compound || {};
    const components: any[] = [];
    if (compound.commune) {
      components.push({ long_name: compound.commune, types: ['route'] });
    }
    if (compound.district) {
      components.push({
        long_name: compound.district,
        types: ['administrative_area_level_2'],
      });
    }
    if (compound.province) {
      components.push({
        long_name: compound.province,
        types: ['administrative_area_level_1'],
      });
    }
    components.push({ long_name: 'Việt Nam', types: ['country'] });
    return components;
  }

  private async callGoongApi(url: string, params: any, attempt: number = 1): Promise<any> {
    try {
      const response = await axios.get(url, {
        params,
        timeout: this.config.timeout,
      });

      const data = response.data;

      if (data.status === 'ZERO_RESULTS') {
        return { status: 'ZERO_RESULTS' };
      }

      if (data.error_message || (data.status && data.status !== 'OK')) {
        throw new Error(`Goong API error: ${data.error_message || data.status}`);
      }

      return data;
    } catch (error: unknown) {
      if (attempt < this.config.retryAttempts && this.isRetryableError(error)) {
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(
          `Retrying Goong API call (attempt ${attempt + 1}/${this.config.retryAttempts}) after ${delay}ms`,
        );
        // eslint-disable-next-line no-undef
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.callGoongApi(url, params, attempt + 1);
      }

      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Goong API call failed: ${errorMsg}`);
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
