# T-0018: Map và Location Picker app_user

**Title**: Map và Location Picker app_user  
**Priority**: P1  
**Projects**: app_user

---

## Mô tả

Tạo màn hình bản đồ với khả năng chọn điểm đón/điểm đến. Sử dụng Google Maps SDK (qua `react-native-maps`) và Google Places API cho tìm kiếm địa chỉ.

## Yêu cầu

### 1. Map Components

#### 1.1. MapView Component
- Sử dụng `react-native-maps` (Google Maps SDK wrapper)
- Hiển thị bản đồ với vị trí hiện tại của user (GPS)
- Zoom level mặc định: 15 (street level)
- Custom map style (light theme)
- Error boundary nếu map không load được

#### 1.2. Location Search Component
- Input tìm kiếm địa chỉ (pickup/dropoff)
- Autocomplete suggestions từ Google Places API (qua backend T-0031)
- Debounce 300ms trước khi gọi API
- Hiển thị list predictions với địa chỉ đầy đủ
- Click prediction → lấy chi tiết (lat, lng, placeId) từ backend

#### 1.3. Location Picker Component
- Cho phép chọn vị trí bằng cách:
  - Nhập địa chỉ (autocomplete)
  - Chạm vào bản đồ
  - Dùng vị trí hiện tại
- Marker pickup (màu xanh lá)
- Marker dropoff (màu đỏ)
- Polyline route giữa pickup và dropoff (từ backend Directions API)
- Hiển thị distance + ETA estimate

### 2. GPS Permission & Location

- Request location permission khi user vào màn hình
- Handle các trường hợp:
  - Permission granted → hiển thị vị trí hiện tại
  - Permission denied → hiển thị thông báo, cho phép nhập thủ công
  - Location unavailable → fallback về địa chỉ nhập thủ công
- Cập nhật vị trí khi user di chuyển (interval 5s nếu map đang active)

### 3. API Integration

#### 3.1. Google Places Autocomplete
```typescript
GET /api/v1/routes/places/autocomplete?query=<input>&language=vi
```
- Gọi khi user gõ vào search box
- Debounce 300ms

#### 3.2. Google Places Details
```typescript
GET /api/v1/routes/places/:placeId
```
- Gọi khi user chọn prediction từ autocomplete
- Lấy chi tiết: lat, lng, address

#### 3.3. Google Directions (Route)
```typescript
POST /api/v1/routes/directions
Body: { origin, destination }
```
- Gọi khi user chọn cả pickup và dropoff
- Hiển thị polyline route trên map
- Hiển thị distance + ETA

### 4. Files cần tạo

- `app_user/src/components/Map/MapView.tsx` - Google Maps component
- `app_user/src/components/Map/LocationSearch.tsx` - Autocomplete search
- `app_user/src/components/Map/LocationPicker.tsx` - Marker + polyline display
- `app_user/src/components/Map/MapError.tsx` - Error boundary cho map
- `app_user/src/hooks/useGooglePlaces.ts` - Hook gọi Places API
- `app_user/src/hooks/useGoogleDirections.ts` - Hook gọi Directions API
- `app_user/src/utils/location.ts` - GPS permission, get current location
- `app_user/src/utils/polyline.ts` - Decode Google polyline string
- `app_user/app/(tabs)/home.tsx` - Update màn hình home với map

### 5. State Management

```typescript
// Zustand store
interface MapState {
  pickup: Location | null;
  dropoff: Location | null;
  route: RouteInfo | null; // polyline, distance, duration
  userLocation: Location | null;
  
  // Actions
  setPickup: (loc: Location) => void;
  setDropoff: (loc: Location) => void;
  fetchRoute: () => Promise<void>;
  clearRoute: () => void;
}
```

### 6. Error Handling

- Google Maps SDK không load được → hiển thị error message + retry button
- Google Places API lỗi → hiển thị thông báo, cho phép nhập thủ công
- Google Directions API lỗi → hiển thị thông báo, không vẽ polyline
- Mất mạng → hiển thị offline message, cache last known location
- GPS không có tín hiệu → fallback về địa chỉ nhập thủ công

### 7. Success Criteria

- [ ] Google Maps SDK hiển thị bản đồ
- [ ] GPS permission handling (granted/denied)
- [ ] Tìm kiếm địa chỉ (Google Places Autocomplete)
- [ ] Chọn pickup/dropoff trên map hoặc bằng address
- [ ] Marker pickup + dropoff hiển thị
- [ ] Polyline route giữa pickup và dropoff
- [ ] Distance + ETA estimate hiển thị
- [ ] Handle mất mạng / GPS unavailable
- [ ] Error boundary cho map component
- [ ] Smooth performance (60 FPS khi pan/zoom)

## Dependencies

- T-0014 (API client) - gọi backend routes API
- T-0031 (Backend Google Maps service) - Places, Directions, Geocoding APIs

## Notes

- Google Maps SDK cho React Native cần setup API key trong `app.config.js` hoặc `.env`
- Restrict API key trên Google Cloud Console theo bundle ID (iOS) / package name (Android)
- Test trên cả iOS và Android
- Performance: memoize markers, limit re-renders

---

**Created**: 2026-06-23  
**Phase**: Created  
**Status**: Planned
