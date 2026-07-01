---
name: map-stack-mapbox-goong
description: DatXe sử dụng Mapbox (map tiles) + Goong API (routing/geocoding/places) thay vì Google Maps
metadata:
  type: project
---

DatXe chuyển từ Google Maps sang **Mapbox + Goong API** (Wave Map: T-0050→T-0056):

- **Map rendering**: `@rnmapbox/maps` (Mapbox GL Native) thay `react-native-maps` PROVIDER_GOOGLE
- **Backend services**: `GoongService` thay `GoogleMapsService` — endpoints: Direction, DistanceMatrix, Geocode, Place/AutoComplete, Place/Detail
- **Goong base URL**: `https://rsapi.goong.io`
- **Lý do**: Google Maps API bị hạn chế Việt Nam (billing), Goong dữ liệu VN chính xác hơn, giá rẻ hơn
- **API contract**: RoutesController (`/routes/*`) giữ nguyên, chỉ swap provider bên trong
- **Env mới**: `GOONG_API_KEY` (backend), `MAPBOX_ACCESS_TOKEN` (cả 2 app)
- **Coordinate order**: Mapbox dùng `[lng, lat]` (GeoJSON), KHÔNG phải `[lat, lng]`!

**Why:** Google Maps API không hoạt động tốt tại VN (hạn chế kích hoạt, giá cao, dữ liệu VN thiếu). Mapbox + Goong là combo phổ biến cho ride-hailing apps tại VN.

**How to apply:** Tất cả map tasks tương lai (T-0041+, T-0035+) phải dùng Mapbox/Goong, không Google Maps. Khi render coordinates trên Mapbox nhớ `[lng, lat]` order.

[[datxe-auth-phone-otp]] [[app-user-requires-dev-build]]
