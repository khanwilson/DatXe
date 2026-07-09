# Plan: T-0070 — FE app_taixe: Trip Flow (Offer → Pickup → Dropoff → Complete)

## Objective

Implement the full driver-side trip flow in `app_taixe`:
1. **Offer screen** — receive `driver.new_offer` WS event, display offer card, accept/reject with countdown timer
2. **Pickup navigation screen** — map with route from driver's current location to pickup point, "I've arrived" button
3. **Active trip screen** — reuse/extend existing `ActiveTripScreen.tsx` (trip route pickup → dropoff, trip status sheet), integrate real BE endpoints
4. **Trip complete screen** — fare summary, back to dashboard

All screens call the real backend trip lifecycle endpoints from T-0068:
- `PATCH /trips/:id/driver-arrived`
- `PATCH /trips/:id/start`
- `PATCH /trips/:id/complete`

---

## Context

### What's already built (T-0069)
- `HomeScreen.tsx` — driver dashboard, online/offline toggle, GPS broadcast, `useDriverSocket` wired with `handleNewOffer` placeholder + `// TODO: Navigate to offer screen (T-0070)`
- `useDriverSocket.ts` — listens to `driver.new_offer`, delivers `NewOfferPayload`
- `useDriverLocation.ts` — GPS tracking, broadcasts to backend
- `socketClient.ts` — singleton socket.io client
- `ENDPOINTS.DRIVER.*` — UPDATE_LOCATION, GO_ONLINE, GO_OFFLINE, GET_STATS

### What's already built in screens
- `ActiveTripScreen.tsx` — full screen with map + `TripStatusSheet`, uses `useTripSimulation` (mock). Needs real trip state wiring.
- `BookingRouteScreen.tsx` — booking flow for app_user side; architecture reference
- `ENDPOINTS` in `config.ts` — needs TRIP endpoints added

### Backend API (T-0068)
| Endpoint | Payload | Description |
|---|---|---|
| `PATCH /trips/:id/driver-arrived` | — | Driver reached pickup |
| `PATCH /trips/:id/start` | — | Trip started |
| `PATCH /trips/:id/complete` | — | Trip completed |
| `GET /drivers/:id/location` | — | Get driver location (not needed by driver app) |

### WebSocket events (T-0068 + T-0063)
| Event | Direction | Payload |
|---|---|---|
| `driver.new_offer` | Server→app_taixe | `NewOfferPayload` (offerId, bookingId, pickup, destination, fare, expiresAt) |
| `driver.offer_response` | app_taixe→Server | `{ offerId, accepted: boolean }` |
| `booking.driver_assigned` | Server→both | `{ tripId, bookingId, driverId }` — confirms offer accepted, provides tripId |
| `trip.status_changed` | Server→both | `{ tripId, bookingId, status }` |

### Existing i18n keys (already in vi.ts + en.ts)
`tripFinding`, `tripEnRoute`, `tripArrived`, `tripInProgress`, `tripCompleted`, `tripFare`, `tripCancel`, `tripDone`, `dashboardWaitingForOffer`

---

## Screens & Components to Build

### 1. `app/OfferScreen.tsx` (new screen)
- Receives `NewOfferPayload` via route params (JSON-stringified or individual params)
- Displays: pickup address, destination address, fare, countdown timer (from `expiresAt`)
- Two buttons: **Nhận cuốc** (Accept) / **Bỏ qua** (Reject)
- On accept: emit `driver.offer_response` → `{ offerId, accepted: true }` → wait for `booking.driver_assigned` → navigate to PickupNavigationScreen with tripId
- On reject/timeout: emit `driver.offer_response` → `{ offerId, accepted: false }` → go back to Dashboard
- i18n keys needed: `offerTitle`, `offerPickup`, `offerDestination`, `offerFare`, `offerAccept`, `offerReject`, `offerExpires`

### 2. `app/PickupNavigationScreen.tsx` (new screen)
- Receives: `tripId`, `pickupLat`, `pickupLng`, `pickupAddress`
- Map showing route from driver's current location to pickup point
- Uses `useDirections` (already available via `useGoongPlace`)
- Bottom sheet with pickup address + **"Tôi đã đến"** (Driver Arrived) button
- On "arrived": call `PATCH /trips/:tripId/driver-arrived` → navigate to ActiveTripScreen with tripId
- i18n keys needed: `pickupNavigationTitle`, `pickupAddress`, `driverArrivedButton`

### 3. `app/ActiveTripScreen.tsx` (modify existing)
- Currently uses `useTripSimulation` (mock) and `MOCK_DRIVER`
- Change: accept `tripId` param, replace simulation with real status flow
- Add `useTripActions` hook (new) for the three PATCH calls
- On "trip started" button (replace simulation start): call `PATCH /trips/:tripId/start`
- On "trip complete": call `PATCH /trips/:tripId/complete` → navigate to TripCompleteScreen
- Keep map + `TripStatusSheet` UI unchanged
- Status now driven by explicit button actions, not timer simulation

### 4. `app/TripCompleteScreen.tsx` (new screen)
- Displays: fare, distance, duration summary
- Single **"Về trang chủ"** button → `router.replace('/(tabs)/HomeScreen')`
- i18n keys needed: `tripCompleteTitle`, `tripCompleteSubtitle`, `tripFareLabel`, `backToHome`

---

## New Hook & Service Files

### `src/api/hooks/useTripActions.ts` (new)
- `arrivedAtPickup(tripId)` → `apiClient.patch(ENDPOINTS.TRIP.DRIVER_ARRIVED(tripId))`
- `startTrip(tripId)` → `apiClient.patch(ENDPOINTS.TRIP.START(tripId))`
- `completeTrip(tripId)` → `apiClient.patch(ENDPOINTS.TRIP.COMPLETE(tripId))`
- Returns `{ arrivedAtPickup, startTrip, completeTrip, loading, error }`

### `src/api/axios/config.ts` (modify)
Add TRIP endpoints:
```ts
TRIP: {
  DRIVER_ARRIVED: (id: string) => `/trips/${id}/driver-arrived`,
  START: (id: string) => `/trips/${id}/start`,
  COMPLETE: (id: string) => `/trips/${id}/complete`,
},
```

---

## Navigation Flow

```
HomeScreen (online, waiting)
  ↓ driver.new_offer WS event
OfferScreen (30s countdown)
  ↓ accept → booking.driver_assigned returns tripId
PickupNavigationScreen (route to pickup)
  ↓ "Tôi đã đến" → PATCH /trips/:id/driver-arrived
ActiveTripScreen (trip in progress)
  ↓ "Bắt đầu chuyến" → PATCH /trips/:id/start
  ↓ "Hoàn tất" → PATCH /trips/:id/complete
TripCompleteScreen (summary)
  ↓ "Về trang chủ"
HomeScreen
```

HomeScreen `handleNewOffer` already has the TODO comment — will call `router.push('/OfferScreen', params)`.

---

## i18n Keys to Add

### vi.ts additions
```ts
offerTitle: 'Cuốc xe mới',
offerPickup: 'Điểm đón',
offerDestination: 'Điểm đến',
offerFare: 'Cước phí',
offerAccept: 'Nhận cuốc',
offerReject: 'Bỏ qua',
offerExpires: 'Hết hạn sau',
pickupNavigationTitle: 'Đến điểm đón',
pickupAddress: 'Địa điểm đón khách',
driverArrivedButton: 'Tôi đã đến',
tripStartButton: 'Bắt đầu chuyến',
tripCompleteTitle: 'Chuyến đi hoàn tất',
tripCompleteSubtitle: 'Cảm ơn bạn đã phục vụ',
tripFareLabel: 'Tổng cước phí',
backToHome: 'Về trang chủ',
```

### en.ts additions (same keys, English values)

---

## Files to Change

### New files
- `app_taixe/app/OfferScreen.tsx`
- `app_taixe/app/PickupNavigationScreen.tsx`
- `app_taixe/app/TripCompleteScreen.tsx`
- `app_taixe/src/api/hooks/useTripActions.ts`

### Modified files
- `app_taixe/app/ActiveTripScreen.tsx` — replace mock simulation with real tripId-driven flow
- `app_taixe/app/(tabs)/HomeScreen.tsx` — wire `handleNewOffer` to navigate to OfferScreen
- `app_taixe/src/api/axios/config.ts` — add TRIP endpoints
- `app_taixe/src/localization/resources/vi.ts` — add i18n keys
- `app_taixe/src/localization/resources/en.ts` — add i18n keys
- `app_taixe/src/localization/iLocalization.ts` — add interface keys

### Out of scope
- `app_user/` — not touched
- `nestjs_prisma/` — not touched (backend already done in T-0068)
- Payment flow changes
- Rating/review
- Push notifications

---

## Acceptance Criteria

1. Driver receives offer, sees countdown, can accept or reject
2. On accept: driver navigates to PickupNavigationScreen with map route to pickup
3. Driver taps "Tôi đã đến" → calls `PATCH /trips/:id/driver-arrived` (no error)
4. ActiveTripScreen shows trip route, driver can tap "Bắt đầu chuyến" → calls `PATCH /trips/:id/start`
5. Driver taps "Hoàn tất" → calls `PATCH /trips/:id/complete` → navigates to TripCompleteScreen
6. TripCompleteScreen shows fare summary, back to dashboard works
7. `bunx tsc --noEmit` passes (0 errors)
8. `bun lint` passes (0 errors)
9. No files outside Allowed Files modified

---

## Risk Notes

- `ActiveTripScreen` currently uses `useTripSimulation` — replacing it with real flow is a controlled change since the component boundaries are already clean
- `booking.driver_assigned` WS event must be listened to in OfferScreen to get `tripId` back after accept — this is standard socket listening, no architectural risk
- DEV mode: mock offer payload already exists in `useDriverSocket.ts` for testing without backend

---

## Estimated Complexity

Medium. No new architectural patterns — follows existing screen/hook/service conventions exactly.
