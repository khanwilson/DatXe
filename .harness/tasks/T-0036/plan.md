# T-0036 Plan — Active trip tracking with routing (app_user)

**Phase**: Planning
**Model**: Sonnet (planning); Implementer will use Opus per harness routing
**Architect required?**: No — single module (app_user), reuses established
map/route/session patterns, no architecture boundary or cross-project contract.

---

## 1. Goal

After `onBook`, take the user to an **active trip tracking screen** that follows a
(mocked) ride through its lifecycle on the Mapbox map: finding driver → driver
en route to pickup → arrived → in progress → completed. Driver assignment and
movement are simulated on the frontend (no realtime backend yet), but structured
so a WebSocket feed can replace the mock later.

## 2. Requirements

- New route screen `app/ActiveTripScreen.tsx` registered in `app/_layout.tsx`.
- Trip lifecycle state machine (mock timers) with 5 states.
- Driver info card + fare/vehicle carried from booking.
- Driver marker on the map that animates along the route toward pickup, then
  toward destination.
- Camera follows the active leg.
- Cancel (pre-IN_PROGRESS) → Home + clear session; completion summary → Home.
- i18n (en + vi), Mai Linh theme tokens, Reanimated for animation.

## 3. Constraints

- Reuse `AppMap`, `useDirections`, `decodePolyline`, `getBounds`, `ZustandSession`.
- Follow TSX file-structure + `stylesSheet`/`useMemo` rule.
- Absolute imports, English code comments, no `console.log`.
- No new dependencies (Reanimated already present).
- Mock only — do not wire real APIs, dialer, or WebSocket.

## 4. Proposed Approach

### 4.1 Data & types (`src/constants/trip.ts` — new)
- `TripStatus` union: `'FINDING' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED'`.
- `MockDriver` type (name, avatar, rating, vehicleModel, plate).
- One mock driver constant + timing constants (finding delay, movement tick).

### 4.2 AppMap enhancement (`src/components/map/AppMap.tsx`)
- Add optional `driver?: [number, number]` prop → render a `PointAnnotation`
  driver marker (distinct style, e.g. car puck). Purely additive; existing
  callers (`BookingRouteScreen`) unaffected.

### 4.3 Trip simulation hook (`src/components/trip/useTripSimulation.ts` — new)
- Input: route coordinates (`[number,number][]`), origin, destination.
- Owns lifecycle state + driver position.
- FINDING → (timer) → EN_ROUTE: interpolate driver marker along a short synthetic
  approach toward origin, or step along the first segment of the route.
- EN_ROUTE → (arrival) → ARRIVED → (timer) → IN_PROGRESS: step driver marker
  along `route` toward destination via index progression on a Reanimated-driven
  interval.
- IN_PROGRESS → (end of route) → COMPLETED.
- Expose `{ status, driverCoord, etaSeconds, progress, cancel }`.
- Cleanup all timers on unmount.

### 4.4 Driver card + status UI (`src/components/trip/TripStatusSheet.tsx` — new)
- Bottom card/sheet that switches content by `status`:
  - FINDING: spinner + "finding a driver".
  - EN_ROUTE/ARRIVED/IN_PROGRESS: driver card (avatar, name, rating, vehicle,
    plate), ETA line, call/message buttons (no-op UI), cancel button (hidden once
    IN_PROGRESS).
  - COMPLETED: fare + distance + duration summary + "Done" button.
- Reuse `AppText`, `AppButton`, `RenderImage`, theme tokens.

### 4.5 Screen (`app/ActiveTripScreen.tsx` — new)
- Read pickup/destination + directions from session (same pattern as
  `BookingRouteScreen`); accept selected vehicle/fare via route params or session.
- Wire `useTripSimulation` → feed `driver`, `route`, `origin`, `destination`,
  camera-follow to `AppMap`.
- Render `TripStatusSheet`; handle cancel/done → `router.replace` to Home +
  clear session trip fields.

### 4.6 Navigation wiring
- `app/_layout.tsx`: register `ActiveTripScreen` (`headerShown: false`).
- `BookingRouteScreen.onBook`: `router.push('/ActiveTripScreen')` (pass selected
  vehicle id / fare as params) instead of only dismissing the modal.

### 4.7 Vehicle/fare hand-off
- Pass `selectedVehicleId` (+ price) from `BookingRouteScreen` to
  `ActiveTripScreen` via expo-router params (typed route). Mock driver ETA/fare
  derived from the selected vehicle.

### 4.8 i18n
- Add trip keys to `en.ts` + `vi.ts` (finding, driverEnRoute, arrived, inProgress,
  completed, eta, call, message, cancelTrip, tripSummary, fare, done, etc.).

## 5. Files (anticipated)

**New**
- `app/ActiveTripScreen.tsx`
- `src/constants/trip.ts`
- `src/components/trip/useTripSimulation.ts`
- `src/components/trip/TripStatusSheet.tsx`

**Modified**
- `src/components/map/AppMap.tsx` (add `driver` marker prop)
- `app/_layout.tsx` (register screen)
- `app/BookingRouteScreen.tsx` (navigate on `onBook`)
- `src/localization/resources/en.ts`, `src/localization/resources/vi.ts`

(Exact allowed-files list finalized in `contract.md`.)

## 6. Risks

- **Marker animation smoothness**: stepping index along polyline may look choppy;
  mitigate with Reanimated interpolation between points + reasonable tick rate.
- **Camera follow vs. bounds fit**: switching between "fit route" and "follow
  driver" can fight; use follow (centerCoordinate on driver) during EN_ROUTE/
  IN_PROGRESS, fit bounds only on entry.
- **Session coupling**: reuse of session pickup/destination means a stale session
  could yield an empty screen; guard with fallbacks like `BookingRouteScreen`.
- **Mock-to-real seam**: keep simulation isolated in `useTripSimulation` so
  T-0026/T-0028 can replace it without touching the screen/card.

## 7. Escalation / Model note

- Planning: Sonnet (single-module UI task, established patterns).
- Implementing: Opus (harness routing).
- No Architect: no architecture boundary, no cross-project contract, no
  schema/API change. If mid-implementation the driver-marker animation forces a
  change to `AppMap`'s public shape beyond an additive prop, revisit.

## 8. Verification

- `npx tsc --noEmit` and `bun lint` from `app_user/`.
- Manual reasoning of lifecycle transitions (no test runner configured; log as
  skipped per CLAUDE.md).
