import { Injectable } from '@nestjs/common';
import { CacheService } from '../../../common/redis/cache.service';
import { GoongConfig } from '../../../config/goong.config';
import * as crypto from 'crypto';

@Injectable()
export class RouteCacheService {
  constructor(
    private cacheService: CacheService,
    private config: GoongConfig,
  ) {}

  private hash(value: string): string {
    return crypto.createHash('md5').update(value).digest('hex');
  }

  async getDirections(origin: string, destination: string, mode: string): Promise<any> {
    const key = `goong:route:${this.hash(origin)}:${this.hash(destination)}:${mode}`;
    return this.cacheService.get(key);
  }

  async setDirections(
    origin: string,
    destination: string,
    mode: string,
    data: any,
  ): Promise<void> {
    const key = `goong:route:${this.hash(origin)}:${this.hash(destination)}:${mode}`;
    await this.cacheService.set(key, data, this.config.cache.directionsTTL);
  }

  async getDistanceMatrix(origins: string[], destinations: string[]): Promise<any> {
    const originsHash = this.hash(origins.join('|'));
    const destHash = this.hash(destinations.join('|'));
    const key = `goong:distance:${originsHash}:${destHash}`;
    return this.cacheService.get(key);
  }

  async setDistanceMatrix(
    origins: string[],
    destinations: string[],
    data: any,
  ): Promise<void> {
    const originsHash = this.hash(origins.join('|'));
    const destHash = this.hash(destinations.join('|'));
    const key = `goong:distance:${originsHash}:${destHash}`;
    await this.cacheService.set(key, data, this.config.cache.distanceMatrixTTL);
  }

  async getGeocoding(lat: number, lng: number): Promise<any> {
    const latRounded = Math.round(lat * 1000000) / 1000000;
    const lngRounded = Math.round(lng * 1000000) / 1000000;
    const key = `goong:geocode:${latRounded}:${lngRounded}`;
    return this.cacheService.get(key);
  }

  async setGeocoding(lat: number, lng: number, data: any): Promise<void> {
    const latRounded = Math.round(lat * 1000000) / 1000000;
    const lngRounded = Math.round(lng * 1000000) / 1000000;
    const key = `goong:geocode:${latRounded}:${lngRounded}`;
    await this.cacheService.set(key, data, this.config.cache.geocodingTTL);
  }

  async getPlacesAutocomplete(query: string): Promise<any> {
    const key = `goong:places:${this.hash(query)}`;
    return this.cacheService.get(key);
  }

  async setPlacesAutocomplete(query: string, data: any): Promise<void> {
    const key = `goong:places:${this.hash(query)}`;
    await this.cacheService.set(key, data, this.config.cache.placesAutocompleteTTL);
  }

  async getPlacesDetails(placeId: string): Promise<any> {
    const key = `goong:place_details:${placeId}`;
    return this.cacheService.get(key);
  }

  async setPlacesDetails(placeId: string, data: any): Promise<void> {
    const key = `goong:place_details:${placeId}`;
    await this.cacheService.set(key, data, this.config.cache.placesDetailsTTL);
  }
}
