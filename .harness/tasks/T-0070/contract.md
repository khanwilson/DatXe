# Contract: T-0070

## Source Inputs
- Plan: `.harness/tasks/T-0070/plan.md`
- Task description: `.harness/tasks/T-0070/description.md`
- Project state: `.harness/PROJECT_STATE.md`

---

## Scope

Wire the full driver-side trip flow in `app_taixe`. As of contracting, most files are already
written (untracked). The outstanding gap is:

1. `HomeScreen.tsx` — replace the TODO comment in `handleNewOffer` with a real `router.push` to `OfferScreen` passing `NewOfferPayload` fields as route params.

All other files in scope have already been written and just need typecheck/lint verification:
- `app_taixe/app/OfferScreen.tsx` (new, untracked)
- `app_taixe/app/PickupNavigationScreen.tsx` (new, untracked)
- `app_taixe/app/TripCompleteScreen.tsx` (new, untracked)
- `app_taixe/src/api/hooks/useTripActions.ts` (new, untracked)
- `app_taixe/app/ActiveTripScreen.tsx` (modified, staged)
- `app_taixe/src/api/axios/config.ts` (modified, staged — TRIP endpoints added)
- `app_taixe/src/components/trip/TripStatusSheet.tsx` (modified, staged)
- `app_taixe/src/localization/iLocalization.ts` (modified, staged — all keys added)
- `app_taixe/src/localization/resources/vi.ts` (modified, staged — all keys added)
- `app_taixe/src/localization/resources/en.ts` (modified, staged — all keys added)

## Out of Scope

- `app_user/` — not touched
- `nestjs_prisma/` — not touched (backend done in T-0068)
- Payment flow, rating/review, push notifications
- Removing `useTripSimulation` / `MOCK_DRIVER` from constants (keep; just no longer used in ActiveTripScreen)
- Any screen not listed in Allowed Files

## Allowed Files

- `app_taixe/app/(tabs)/HomeScreen.tsx` — wire handleNewOffer navigation (only change)
- `app_taixe/app/OfferScreen.tsx` — new file (fix any lint/type issues only)
- `app_taixe/app/PickupNavigationScreen.tsx` — new file (fix any lint/type issues only)
- `app_taixe/app/TripCompleteScreen.tsx` — new file (fix any lint/type issues only)
- `app_taixe/app/ActiveTripScreen.tsx` — already modified (fix any lint/type issues only)
- `app_taixe/src/api/hooks/useTripActions.ts` — new file (fix any lint/type issues only)
- `app_taixe/src/api/axios/config.ts` — already modified (fix any lint/type issues only)
- `app_taixe/src/components/trip/TripStatusSheet.tsx` — already modified (fix any lint/type issues only)
- `app_taixe/src/localization/iLocalization.ts` — already modified (fix any lint/type issues only)
- `app_taixe/src/localization/resources/vi.ts` — already modified (fix any lint/type issues only)
- `app_taixe/src/localization/resources/en.ts` — already modified (fix any lint/type issues only)
- `.harness/tasks/T-0070/status.md` — inline updates
- `.harness/tasks/T-0070/implementation.md` — create/update inline
- `.harness/tasks/T-0070/files-changed.md` — create/update inline

## Protected Files / Projects

- `app_user/` — do not touch
- `nestjs_prisma/` — do not touch
- Any file not listed in Allowed Files above

## Acceptance Criteria

- [ ] `HomeScreen.tsx` `handleNewOffer` calls `router.push('/OfferScreen', { offerId, bookingId, pickupAddress: pickup.address, pickupLat: String(pickup.lat), pickupLng: String(pickup.lng), destinationAddress: destination.address, fare: String(fare), expiresAt })` (all `NewOfferPayload` fields mapped to string params)
- [ ] OfferScreen countdown timer starts from `expiresAt`; reject/timeout returns to HomeScreen
- [ ] OfferScreen accept emits `driver.offer_response { offerId, accepted: true }`, waits for `booking.driver_assigned`, navigates to PickupNavigationScreen with `tripId`, `pickupLat`, `pickupLng`, `pickupAddress`
- [ ] PickupNavigationScreen renders AppMap with route from driver location to pickup; "Tôi đã đến" button calls `PATCH /trips/:id/driver-arrived` then navigates to ActiveTripScreen
- [ ] ActiveTripScreen receives `tripId` param; "Bắt đầu chuyến" calls `PATCH /trips/:id/start`; "Hoàn tất" calls `PATCH /trips/:id/complete` then navigates to TripCompleteScreen
- [ ] TripCompleteScreen shows fare/distance/duration summary; "Về trang chủ" navigates to `/(tabs)/HomeScreen`
- [ ] `bunx tsc --noEmit` passes with 0 errors in `app_taixe/`
- [ ] `bun lint` passes with 0 errors in `app_taixe/`
- [ ] No files outside Allowed Files are modified

## Required Checks

- [ ] typecheck: `cd /Users/chubo/Work/DatXe/app_taixe && bunx tsc --noEmit`
- [ ] lint: `cd /Users/chubo/Work/DatXe/app_taixe && bun lint`
- [ ] manual: no `console.log` calls (only `debug`/`warn`/`error`/`info`)
- [ ] manual: no hardcoded secrets or API keys
- [ ] manual: all imports are absolute (no `../` crossing module boundaries)

## API Contract

All endpoints are already implemented in T-0068. Driver app calls:

| Method | Path | When |
|--------|------|------|
| `PATCH` | `/api/v1/trips/:id/driver-arrived` | Driver taps "Tôi đã đến" |
| `PATCH` | `/api/v1/trips/:id/start` | Driver taps "Bắt đầu chuyến" |
| `PATCH` | `/api/v1/trips/:id/complete` | Driver taps "Hoàn tất" |

WebSocket (server → app_taixe):
- `driver.new_offer` → `NewOfferPayload { offerId, bookingId, pickup: {address,lat,lng}, destination: {address}, fare, expiresAt }`
- `booking.driver_assigned` → `{ tripId, bookingId, driverId }`

WebSocket (app_taixe → server):
- `driver.offer_response` → `{ offerId, accepted: boolean }`

## Database / Migration Impact

None. FE-only task.

## Security / Secrets / Auth Impact

None. All PATCH endpoints use the existing JWT auth interceptor already wired in `apiClient`.

## Native / Release Impact

None. No new native modules or permissions.

## Implementation Constraints

1. TSX file structure: imports → variables/types → component → stylesheet → export
2. StyleSheet: `stylesSheet` factory after component, consumed via `useMemo(() => stylesSheet(theme), [theme])`
3. Absolute imports only — `components/*`, `api/*`, `theme/*`, `zustand/*`, `localization/*`, `utils/*`, `constants/*`
4. `AppText` not RN `Text`; `AppButton` for interactive buttons
5. No new dependencies — existing packages only
6. `console.log` is an ESLint error — use `console.debug` for debug output
7. HomeScreen navigation: `NewOfferPayload` fields must be stringified as individual route params (Expo Router does not serialize objects)
8. OfferScreen: guard `responded.current` ref prevents double-emit on accept/reject
9. ActiveTripScreen: `MOCK_DRIVER` stays in the props (TripStatusSheet requires it); do not remove the constant

## Fix Loop Rules

- If typecheck or lint fails: fix the specific error in the specific file only; do not refactor surrounding code
- If a new file has an import error: check `tsconfig.json` paths first before changing the import style
- Maximum 2 fix attempts per file before escalating

## Escalation Triggers

- Any change required to `nestjs_prisma/` or `app_user/`
- A new dependency is needed that is not already installed
- `TripStatusSheet` interface change requires modifying files outside Allowed Files
- Router type errors require changes to Expo Router's typed routes config

## User Approvals

None required. Scope is entirely within `app_taixe`, no backend or schema changes.

## Status

READY_FOR_IMPLEMENTING
