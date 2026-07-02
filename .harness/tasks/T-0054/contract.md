# T-0054 Contract — Route Display with Mapbox Directions Layer (app_user)

**Task**: T-0054
**Status**: Contracted
**Priority**: P1
**Projects**: app_user
**Depends On**: T-0050 (backend Goong `/routes/directions`, Done), T-0052 (AppMap on Mapbox, Done)

---

## Scope

### In Scope

- Add `ROUTES.DIRECTIONS` endpoint to `app_user/src/api/axios/config.ts`
- Add `getDirections()` method and typed response interfaces to `app_user/src/api/services/goongPlaceService.ts`
- Add `useDirections()` query hook to `app_user/src/api/hooks/useGoongPlace.ts`
- Add `@mapbox/polyline` dependency to decode Goong-encoded polylines
- Create `app_user/src/utils/functions/decodePolyline.ts` utility (decode + bounds helper)
- Extend `AppMap` component (`IAppMapProps`) to accept optional route, origin, destination, bounds props
- Render route polyline via `ShapeSource` + `LineLayer` on the map
- Render origin/destination markers via `PointAnnotation`
- Wire HomeScreen to fetch directions when destination is selected, display route + summary card
- Add localization strings for route summary and error messages (`en.ts` + `vi.ts`)

### Out of Scope

- Turn-by-turn navigation
- Alternative routes selection
- Real-time route updates during trip (T-0036)
- Booking confirmation after route shown (T-0035)
- Modifying any files in `app_taixe/` or `nestjs_prisma/`
- Modifying existing Mapbox camera behavior outside the route-display flow
- Changing backend `/routes/directions` endpoint

---

## Allowed Files

**May be modified or created:**

- `app_user/src/api/axios/config.ts`
- `app_user/src/api/services/goongPlaceService.ts`
- `app_user/src/api/hooks/useGoongPlace.ts`
- `app_user/src/components/map/AppMap.tsx`
- `app_user/app/(tabs)/HomeScreen.tsx`
- `app_user/src/utils/functions/decodePolyline.ts` (new file)
- `app_user/src/localization/en.ts`
- `app_user/src/localization/vi.ts`
- `app_user/package.json`
- `app_user/bun.lock` (will be modified by dependency install)

**Protected (do not modify):**

- `app_taixe/**`
- `nestjs_prisma/**`
- Any files not listed in "Allowed Files" above

---

## Acceptance Criteria

- [ ] Route polyline is rendered on the map after a destination is selected
- [ ] Origin marker appears at the user's current location
- [ ] Destination marker appears at the selected place
- [ ] Camera auto-fits to show the entire route with appropriate padding
- [ ] Route summary card displays distance (km) and duration (minutes)
- [ ] Loading indicator is shown while the route is being fetched
- [ ] Error message is displayed if the route fetch fails
- [ ] Polyline is styled with `theme.color.map.route` color and appropriate width
- [ ] TypeScript compiles without errors
- [ ] Lint passes with no new warnings or errors

---

## API Contracts

### Backend Endpoint (consumed, not modified)

```
POST /routes/directions
```

**Request:**
```json
{
  "origin": "lat,lng",
  "destination": "lat,lng",
  "mode": "driving"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "overview_polyline": {
          "points": "<encoded polyline string>"
        },
        "legs": [
          {
            "distance": { "text": "5.2 km", "value": 5200 },
            "duration": { "text": "12 mins", "value": 720 }
          }
        ]
      }
    ],
    "summary": {
      "totalDistance": { "text": "5.2 km", "value": 5200 },
      "totalDuration": { "text": "12 mins", "value": 720 }
    }
  }
}
```

**Frontend unwrap pattern:**
```typescript
const response = await apiClient.post<ApiResponse<DirectionsResponse>>('/routes/directions', body);
const data = response.data?.data;
```

---

## Database Impact

None. This task only consumes an existing backend API endpoint. No Prisma schema changes.

---

## Dependencies

**New dependency to add:**
- `@mapbox/polyline` — for decoding Goong-encoded polyline strings

**Existing dependencies used:**
- `@rnmapbox/maps@10.3.1` — Mapbox rendering (ShapeSource, LineLayer, PointAnnotation, Camera)
- `zustand` — ZustandSession for selectedDestination
- React Query (`@tanstack/react-query`) — useQuery hook
- Existing theme system (`theme.color.map.route`)

---

## Test Strategy

1. **TypeScript compilation**: Run `tsc --noEmit` to verify no type errors
2. **Lint**: Run `bun run lint` to ensure no new lint violations
3. **Manual testing**:
   - Select a destination on SearchDestinationScreen
   - Verify route polyline appears on HomeScreen map
   - Verify origin/destination markers appear
   - Verify camera fits to show full route
   - Verify route summary card shows distance and duration
   - Test loading state (slow network)
   - Test error state (disconnect network, invalid destination)

---

## Constraints

1. Follow existing code patterns in `goongPlaceService.ts` and `useGoongPlace.ts`
2. Use `theme.color.map.route` for polyline color (existing theme token)
3. Use existing localization pattern (`localization/en.ts`, `localization/vi.ts`)
4. Do not add `console.log` statements
5. Follow TypeScript strict mode
6. Maintain existing Mapbox camera behavior — route fit should only apply when a route is displayed
7. Do not modify files outside Allowed Files

---

## User Approvals

- [x] Plan approved by user (2026-07-02)
- [ ] New dependency `@mapbox/polyline` — logged per CLAUDE.md rule 9 (will be tracked in evaluation)
