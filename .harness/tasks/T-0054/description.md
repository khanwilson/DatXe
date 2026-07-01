# T-0054: Frontend — Route Display with Mapbox Directions Layer (app_user)

**Status**: Planned  
**Priority**: P1  
**Projects**: app_user  
**Depends On**: T-0050, T-0052

---

## Description

After user selects a destination (T-0053), display the driving route on the Mapbox map as a polyline. Fetch route from backend (`POST /routes/directions`) which now calls Goong API (T-0050), then render the polyline geometry on the map.

Also show:
- Origin marker (user's current location)
- Destination marker
- Route summary (distance, ETA)
- Camera fit to show full route

---

## Scope

### In Scope
- Create route fetching hook/service (calls backend `/routes/directions`)
- Decode polyline from Goong response (encoded polyline → coordinate array)
- Render `<MapboxGL.ShapeSource>` + `<MapboxGL.LineLayer>` for route polyline
- Add origin/destination markers on map
- Fit camera to route bounds (show full route)
- Display route summary card (distance text + duration text)
- Handle loading state while fetching route
- Handle error state (no route found, network error)

### Out of Scope
- Turn-by-turn navigation (future)
- Alternative routes display (future enhancement)
- Real-time route updates during trip (T-0036)
- Booking confirmation after route shown (T-0035)

---

## Acceptance Criteria

- [ ] Route polyline rendered on map after destination selected
- [ ] Origin marker at user's current location
- [ ] Destination marker at selected place
- [ ] Camera auto-fits to show entire route with padding
- [ ] Route summary shows distance (km) and duration (minutes)
- [ ] Loading indicator while fetching route
- [ ] Error handling if route fetch fails
- [ ] Polyline styled (color, width) matching theme
- [ ] TypeScript compiles
- [ ] Lint passes

---

## Technical Notes

### Polyline Decoding
Goong (like Google) returns encoded polyline strings. Need a decoder:
```typescript
// Use @mapbox/polyline or custom decoder
import polyline from '@mapbox/polyline';
const coordinates = polyline.decode(encodedString)
  .map(([lat, lng]) => [lng, lat]); // Convert to GeoJSON [lng, lat]
```

### Mapbox Route Rendering
```tsx
import MapboxGL from '@rnmapbox/maps';

const routeGeoJSON = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [[lng1, lat1], [lng2, lat2], ...],
  },
};

<MapboxGL.ShapeSource id="route" shape={routeGeoJSON}>
  <MapboxGL.LineLayer
    id="routeLine"
    style={{
      lineColor: theme.color.map.route,
      lineWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
    }}
  />
</MapboxGL.ShapeSource>
```

### Camera Fit to Route
```tsx
<MapboxGL.Camera
  bounds={{
    ne: [maxLng, maxLat],
    sw: [minLng, minLat],
    paddingTop: 100,
    paddingBottom: 200,
    paddingLeft: 50,
    paddingRight: 50,
  }}
  animationDuration={1000}
/>
```

### Backend Call
```typescript
// POST /routes/directions
const response = await apiClient.post('/routes/directions', {
  origin: `${userLat},${userLng}`,
  destination: `${destLat},${destLng}`,
  mode: 'driving',
});
// response.data.routes[0].overview_polyline.points → encoded polyline
// response.data.summary.totalDistance → { text: "5.2 km", value: 5200 }
// response.data.summary.totalDuration → { text: "12 mins", value: 720 }
```
