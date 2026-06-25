import { IsString, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';

export class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class GetDirectionsRequestDto {
  @IsString()
  origin: string;

  @IsString()
  destination: string;

  @IsOptional()
  @IsArray()
  waypoints?: string[];

  @IsOptional()
  @IsEnum(['driving', 'walking', 'transit'])
  mode?: string;

  @IsOptional()
  alternatives?: boolean;
}

export class GetDistanceMatrixRequestDto {
  @IsArray()
  @IsString({ each: true })
  origins: string[];

  @IsArray()
  @IsString({ each: true })
  destinations: string[];

  @IsOptional()
  @IsEnum(['driving', 'walking'])
  mode?: string;
}

export class GetGeocodingRequestDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class GetPlacesAutocompleteQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class GetPlacesDetailsParamDto {
  @IsString()
  placeId: string;
}

export class DistanceValueDto {
  text: string;
  value: number;
}

export class RouteStepDto {
  instruction: string;
  distance: DistanceValueDto;
  duration: DistanceValueDto;
}

export class RouteDto {
  polyline: string;
  distance: DistanceValueDto;
  duration: DistanceValueDto;
  steps: RouteStepDto[];
}

export class RouteSummaryDto {
  totalDistance: DistanceValueDto;
  totalDuration: DistanceValueDto;
  trafficModel?: string;
}

export class GetDirectionsResponseDto {
  routes: RouteDto[];
  summary: RouteSummaryDto;
}

export class DistanceMatrixCellDto {
  distance: DistanceValueDto;
  duration: DistanceValueDto;
  status: string;
}

export class GetDistanceMatrixResponseDto {
  matrix: DistanceMatrixCellDto[][];
}

export class AddressComponentDto {
  street?: string;
  district?: string;
  city?: string;
  country?: string;
}

export class GetGeocodingResponseDto {
  address: string;
  placeId: string;
  components: AddressComponentDto;
}

export class PlacePredictionDto {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export class GetPlacesAutocompleteResponseDto {
  predictions: PlacePredictionDto[];
}

export class PlacePhotoDto {
  url: string;
}

export class GetPlacesDetailsResponseDto {
  placeId: string;
  name: string;
  address: string;
  location: LocationDto;
  phoneNumber?: string;
  rating?: number;
  photos?: PlacePhotoDto[];
}
