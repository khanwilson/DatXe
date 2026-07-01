# T-0052: Frontend — Migrate AppMap Component to Mapbox (app_user)

**Status**: Planned  
**Priority**: P1  
**Projects**: app_user  
**Depends On**: T-0051

---

## Description

Rewrite `src/components/map/AppMap.tsx` to use `@rnmapbox/maps` instead of `react-native-maps`. Maintain the same public API (`AppMapHandle`, `IAppMapProps`) as much as possible so consuming screens don't break.

Also update `useCurrentLocation.ts` to remove `react-native-maps` Region dependency (use Mapbox camera position instead).

---

## Scope

### In Scope
- Rewrite `AppMap.tsx` with Mapbox `MapView`, `Camera`, `PointAnnotation`/`MarkerView`
- Update `AppMapHandle` interface (animateToRegion → animateToPosition or similar)
- Update `useCurrentLocation.ts` to return Mapbox-compatible position (not Region)
- Update `src/constants/map.ts` with Mapbox-compatible defaults
- Update `HomeScreen` (or whatever screen uses AppMap) to work with new handle/props
- Maintain user location dot styling
- Maintain recenter button functionality

### Out of Scope
- Search/autocomplete (T-0053)
- Route polyline display (T-0054)
- Removing `react-native-maps` package (T-0056)

---

## Acceptance Criteria

- [ ] `AppMap` renders Mapbox map tiles full-screen
- [ ] User location shown (blue dot or custom marker)
- [ ] Camera starts at user location (or HCMC fallback)
- [ ] Recenter button animates camera back to user
- [ ] `AppMapHandle.animateToRegion` (or equivalent) works from parent
- [ ] No `react-native-maps` imports in map components
- [ ] HomeScreen functions as before (map + search panel overlay)
- [ ] TypeScript compiles
- [ ] Lint passes

---

## Technical Notes

### Mapbox MapView equivalent
```tsx
import MapboxGL from '@rnmapbox/maps';

<MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
  <MapboxGL.Camera
    ref={cameraRef}
    zoomLevel={14}
    centerCoordinate={[lng, lat]}
    animationMode="flyTo"
    animationDuration={500}
  />
  <MapboxGL.UserLocation visible={true} />
  {/* Custom marker */}
  <MapboxGL.PointAnnotation id="user" coordinate={[lng, lat]}>
    <View style={styles.userDot} />
  </MapboxGL.PointAnnotation>
</MapboxGL.MapView>
```

### Key Differences
| react-native-maps | @rnmapbox/maps |
|---|---|
| `<MapView provider={PROVIDER_GOOGLE}>` | `<MapboxGL.MapView>` |
| `initialRegion={{ lat, lng, latDelta, lngDelta }}` | `<Camera centerCoordinate={[lng, lat]} zoomLevel={14}>` |
| `<Marker coordinate={}>` | `<PointAnnotation coordinate={[lng, lat]}>` |
| `mapRef.animateToRegion(region)` | `cameraRef.setCamera({ centerCoordinate, zoomLevel })` |
| `showsUserLocation` prop | `<UserLocation />` component |
| Coordinate: `{ latitude, longitude }` | Coordinate: `[longitude, latitude]` (GeoJSON order!) |

**⚠️ IMPORTANT**: Mapbox uses `[lng, lat]` (GeoJSON order), NOT `[lat, lng]`!
