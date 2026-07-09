# T-0071: FE app_user — Trip Flow (Looking → Pickup → Dropoff → Complete)

## Summary

Implement the full passenger trip flow in app_user, covering all states from searching for a driver through completing the trip. This supersedes T-0065.

## Scope

Build the complete passenger-side trip lifecycle UI and logic in app_user:

1. **Looking for Driver** — After payment, show animated radar/spinner; listen to WebSocket `trip.status_changed` for `DRIVER_ASSIGNED` state; display driver info when found
2. **Driver En Route to Pickup** — Show driver location on map with live updates via `driver.location_updated`; show ETA; user can cancel within window
3. **Driver Arrived** — When `trip.status_changed` → `DRIVER_ARRIVED`, show "Driver has arrived" notification; display waiting UI
4. **Trip In Progress** — When `trip.status_changed` → `IN_PROGRESS`, map switches to show route to dropoff; show live driver position
5. **Trip Complete** — When `trip.status_changed` → `COMPLETED`, show trip summary (fare, distance, duration); option to rate driver

## Dependencies Completed

- **T-0064** (FE): `socketClient.ts`, `useBookingSocket.ts`, `bookingSession` Zustand store, `RadarAnimation.tsx` already built
- **T-0068** (BE): `trip.status_changed` WS event `{ tripId, bookingId, status }`, `driver.location_updated` WS event `{ driverId, lat, lng, heading }`, `GET /drivers/:id/location`

## Available Infrastructure (from T-0064)

### Existing Files to Build On
- `app_user/src/api/socket/socketClient.ts` — singleton WS client
- `app_user/src/api/socket/useBookingSocket.ts` — booking real-time updates hook
- `app_user/src/api/hooks/useBooking.ts` — booking state hook
- `app_user/src/zustand/session.ts` — `bookingSession` store (has current booking/trip state)
- `app_user/src/components/map/RadarAnimation.tsx` — animated radar (reuse for Looking state)
- `app_user/app/BookingRouteScreen.tsx` — parent screen (current entry point after payment)
- `app_user/src/components/route/RouteBookingModal.tsx` — booking modal (transitions into trip flow)

## WebSocket Events to Consume

| Event | Payload | When |
|-------|---------|------|
| `trip.status_changed` | `{ tripId, bookingId, status }` | Status transitions |
| `driver.location_updated` | `{ driverId, lat, lng, heading }` | Live driver tracking |

## Trip Status States

```
PENDING → DRIVER_ASSIGNED → DRIVER_EN_ROUTE → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED
                                                                             → CANCELLED
```

## Map Stack

- Mapbox (`@rnmapbox/maps`) for map tiles and route display
- Goong API for routing
- Coordinate order: `[lng, lat]` GeoJSON

## Conventions

- TSX file structure: imports → variables → render → stylesheet → export
- `useMemo(() => stylesSheet(theme), [theme])` for styles
- i18n: add keys to `iLocalization.ts`, `vi.ts`, `en.ts`
- No hardcoded colors; use theme tokens

## Acceptance Criteria

- [ ] After payment, show "Looking for driver" screen with radar animation
- [ ] When `DRIVER_ASSIGNED`: show driver info card (name, vehicle, rating)
- [ ] When `DRIVER_EN_ROUTE`: map shows live driver pin updating via WebSocket
- [ ] When `DRIVER_ARRIVED`: show "Driver has arrived" notification/state
- [ ] When `IN_PROGRESS`: map shows route to dropoff with live driver position
- [ ] When `COMPLETED`: show trip summary screen (fare, distance, duration)
- [ ] Cancellation option shown during Looking/En Route states
- [ ] DEV mock trip flow works without live backend
- [ ] TypeScript and ESLint pass
