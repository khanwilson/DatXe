# T-0031: Google Maps Routing Service Backend

**Title**: Google Maps Routing Service Backend  
**Priority**: P1  
**Projects**: nestjs_prisma

---

## Mô tả

Tạo service backend tích hợp Google Maps Platform để cung cấp các API về routing, geocoding, distance calculation cho các app mobile. Service này sẽ cache kết quả trong Redis để giảm chi phí API call.

## Yêu cầu

### 1. Google Maps API Integration

Tích hợp các Google Maps API sau:

| API | Mục đích |
|-----|----------|
| **Google Directions API** | Tính route giữa 2 điểm, trả về polyline, distance, duration |
| **Google Distance Matrix API** | Tính khoảng cách/thời gian giữa nhiều origins và destinations |
| **Google Geocoding API** | Chuyển đổi tọa độ (lat, lng) ↔ địa chỉ |
| **Google Places API** | Autocomplete tìm kiếm địa chỉ, place details |

### 2. Routes Service API

#### 2.1. POST /api/v1/routes/directions
```typescript
Request:
{
  origin: { lat: number, lng: number } | string, // string = place_id hoặc address
  destination: { lat: number, lng: number } | string,
  waypoints?: Array<{ lat: number, lng: number }>, // optional intermediate stops
  mode: 'driving' | 'walking' | 'transit', // mặc định: driving
  alternatives?: boolean // trả về nhiều route options
}

Response:
{
  success: true,
  data: {
    routes: Array<{
      polyline: string, // encoded polyline để frontend decode
      distance: { text: string, value: number }, // text: "12.5 km", value: 12500 (meters)
      duration: { text: string, value: number }, // text: "25 mins", value: 1500 (seconds)
      steps: Array<{
        instruction: string, // "Rẽ phải tại ngã ba"
        distance: { text: string, value: number },
        duration: { text: string, value: number }
      }>
    }>,
    summary: {
      totalDistance: { text: string, value: number },
      totalDuration: { text: string, value: number },
      trafficModel?: string // nếu có traffic info
    }
  }
}
```

#### 2.2. POST /api/v1/routes/distance-matrix
```typescript
Request:
{
  origins: Array<{ lat: number, lng: number } | string>,
  destinations: Array<{ lat: number, lng: number } | string>,
  mode: 'driving' | 'walking'
}

Response:
{
  success: true,
  data: {
    matrix: Array<Array<{
      distance: { text: string, value: number },
      duration: { text: string, value: number },
      status: 'OK' | 'NOT_FOUND'
    }>>
  }
}
```

#### 2.3. POST /api/v1/routes/geocode
```typescript
Request:
{
  lat: number,
  lng: number
}

Response:
{
  success: true,
  data: {
    address: string, // "123 Đường ABC, Quận XYZ, TP HCM"
    placeId: string,
    components: {
      street?: string,
      district?: string,
      city?: string,
      country?: string
    }
  }
}
```

#### 2.4. GET /api/v1/routes/places/autocomplete?query=...
```typescript
Request: GET /api/v1/routes/places/autocomplete?query=123+nguyen+hue&language=vi

Response:
{
  success: true,
  data: {
    predictions: Array<{
      placeId: string,
      description: string, // "123 Nguyễn Huệ, Quận 1, TP HCM"
      mainText: string, // "123 Nguyễn Huệ"
      secondaryText: string // "Quận 1, TP HCM"
    }>
  }
}
```

#### 2.5. GET /api/v1/routes/places/:placeId
```typescript
Response:
{
  success: true,
  data: {
    placeId: string,
    name: string,
    address: string,
    location: { lat: number, lng: number },
    phoneNumber?: string,
    rating?: number,
    photos?: Array<{ url: string }>
  }
}
```

### 3. Caching Strategy

- **Directions API**: Cache trong Redis với key `route:{origin_hash}:{dest_hash}:{mode}`, TTL 15 phút (cùng tọa độ → cùng route trong thời gian ngắn)
- **Distance Matrix**: Cache với key `distance:{origin_hash}:{dest_hash}`, TTL 15 phút
- **Geocoding**: Cache với key `geocode:{lat_rounded}:{lng_rounded}` (làm tròn 6 chữ số), TTL 1 giờ
- **Places Autocomplete**: Cache với key `places:{query_hash}`, TTL 5 phút
- **Places Details**: Cache với key `place_details:{placeId}`, TTL 1 giờ

### 4. Error Handling

- Google API timeout: retry 2 lần, exponential backoff
- Google API error: trả về error response với Google API error code
- Quota exceeded: trả về 503 Service Unavailable
- Invalid API key: trả về 500 Internal Server Error + log cảnh báo

### 5. Configuration

```typescript
// .env
GOOGLE_MAPS_API_KEY=...
GOOGLE_MAPS_BASE_URL=https://maps.googleapis.com/maps/api

// config/google-maps.config.ts
{
  apiKey: string,
  baseUrl: string,
  timeout: 10000, // 10 seconds
  retryAttempts: 2,
  cache: {
    directionsTTL: 900, // 15 minutes
    distanceMatrixTTL: 900,
    geocodingTTL: 3600, // 1 hour
    placesAutocompleteTTL: 300, // 5 minutes
    placesDetailsTTL: 3600
  }
}
```

## Files cần tạo/cập nhật

### Tạo mới:
- `nestjs_prisma/src/modules/routes/routes.module.ts`
- `nestjs_prisma/src/modules/routes/routes.controller.ts`
- `nestjs_prisma/src/modules/routes/routes.service.ts`
- `nestjs_prisma/src/modules/routes/dto/` (create-route.dto.ts, route-response.dto.ts)
- `nestjs_prisma/src/modules/routes/services/google-maps.service.ts` (wrapper cho Google Maps API)
- `nestjs_prisma/src/modules/routes/services/route-cache.service.ts` (Redis caching)
- `nestjs_prisma/src/config/google-maps.config.ts`
- `nestjs_prisma/test/routes/routes.e2e-spec.ts`

### Cập nhật:
- `nestjs_prisma/src/app.module.ts` - import RoutesModule
- `nestjs_prisma/.env.example` - thêm GOOGLE_MAPS_API_KEY
- `nestjs_prisma/package.json` - thêm @googlemaps/google-maps-services-js (optional, hoặc dùng axios)

## Dependencies

- T-0003 (Redis connection) - cần Redis để cache route results
- Axios hoặc @googlemaps/google-maps-services-js - HTTP client

## Success Criteria

- [ ] Tất cả 5 routes API hoạt động đúng spec
- [ ] Google Maps API calls được cache trong Redis
- [ ] Error handling đầy đủ cho Google API errors
- [ ] API documentation trong Swagger
- [ ] Unit tests cho routes service
- [ ] Integration tests với Google Maps API (mock hoặc real)
- [ ] Configuration được validate khi app start
- [ ] Không hardcode API key trong source code

## Rủi ro

1. **Google Maps API quota/cost**: Monitor usage, setup billing alert trên Google Cloud Console
2. **API rate limit**: Implement rate limiting nếu cần
3. **Latency**: Google API calls có thể chậm (1-3s) → caching giúp giảm latency
4. **Dependency vào Google Maps**: Nếu Google Maps down → service không hoạt động. Cần có fallback error message rõ ràng.

## Lưu ý

- Restrict Google API key trên Google Cloud Console: chỉ allow từ backend IP/domain
- Enable billing trên Google Cloud Console
- Monitor API usage để tránh vượt budget
- Không log API key trong logs
- Không trả về API key cho frontend

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
