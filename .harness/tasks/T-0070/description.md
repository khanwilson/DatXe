# T-0070: FE app_taixe — Trip Flow (Offer → Pickup → Dropoff → Complete)

## Summary

Implement the full driver trip flow in app_taixe, covering all states from receiving a booking offer through completing the trip. This supersedes T-0042, T-0043, T-0044.

## Scope

Build the complete driver-side trip lifecycle UI and logic in app_taixe:

1. **Offer Screen** — Driver receives `driver.new_offer` WebSocket event, sees trip details (pickup, dropoff, fare, distance), and can Accept or Decline
2. **En Route to Pickup** — After accepting, map shows route to pickup point; driver can tap "Arrived at Pickup"
3. **Arrived at Pickup** — Calls `PATCH /trips/:id/driver-arrived`; shows waiting state; driver taps "Start Trip"
4. **Trip In Progress** — Calls `PATCH /trips/:id/start`; map shows route to dropoff; driver taps "Complete Trip"
5. **Trip Complete** — Calls `PATCH /trips/:id/complete`; shows summary screen; returns to dashboard

## Dependencies Completed

- **T-0068** (BE): Trip lifecycle endpoints (`/trips/:id/driver-arrived`, `/trips/:id/start`, `/trips/:id/complete`), WebSocket events (`driver.new_offer`, `trip.status_changed`, `driver.location_updated`)
- **T-0069** (FE foundation): Socket.io client singleton (`socketClient.ts`), `useDriverSocket` hook (listens for `driver.new_offer`), `useDriverLocation` hook (GPS broadcast), driver dashboard (`HomeScreen.tsx`)

## Available Infrastructure (from T-0068 + T-0069)

### API Endpoints
- `PATCH /trips/:id/driver-arrived` — JWT (driver owner)
- `PATCH /trips/:id/start` — JWT (driver owner)
- `PATCH /trips/:id/complete` — JWT (driver owner)
- `GET /drivers/:id/location` — JWT

### WebSocket Events (Server → Client)
- `driver.new_offer` — `{ bookingId, pickup, dropoff, fare, distance, passenger }` (already handled in useDriverSocket)
- `trip.status_changed` — `{ tripId, bookingId, status }`
- `driver.location_updated` — `{ driverId, lat, lng, heading }`

### Existing Files to Build On
- `app_taixe/src/api/socket/socketClient.ts` — singleton WS client
- `app_taixe/src/api/hooks/useDriverSocket.ts` — new_offer listener with DEV mock
- `app_taixe/src/api/hooks/useDriverLocation.ts` — GPS broadcast
- `app_taixe/app/(tabs)/HomeScreen.tsx` — driver dashboard (online/offline, map)
- `app_taixe/src/api/axios/config.ts` — DRIVER endpoints already added

## Map Stack

- Mapbox (`@rnmapbox/maps`) for map tiles and route display
- Goong API for routing (via backend or direct Goong Directions call)
- Coordinate order: `[lng, lat]` GeoJSON

## Conventions

- TSX file structure: imports → variables → render → stylesheet → export
- `useMemo(() => stylesSheet(theme), [theme])` for styles
- i18n: add keys to `iLocalization.ts`, `vi.ts`, `en.ts`
- Enum imports from `@prisma/client` if needed on BE side (not applicable here — FE only)
- No hardcoded colors; use theme tokens

## Acceptance Criteria

- [ ] Driver on dashboard receives offer popup/screen with trip details
- [ ] Driver can Accept → map shows route to pickup
- [ ] Driver taps "Arrived at Pickup" → calls BE, updates state
- [ ] Driver taps "Start Trip" → calls BE, map switches to dropoff route
- [ ] Driver taps "Complete Trip" → calls BE, shows completion summary
- [ ] Driver can Decline offer → returns to dashboard
- [ ] DEV mock offer flow works without live backend
- [ ] TypeScript and ESLint pass
