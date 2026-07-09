# Handoff: T-0070 — FE app_taixe: Trip Flow

## Summary

Completed the full driver-side trip flow in `app_taixe`. Most screens were already written in a prior session (untracked files). This session wired the final missing piece — `HomeScreen.tsx` navigation — and fixed two type errors in `OfferScreen.tsx`.

## Files Changed

### New files
- `app_taixe/app/OfferScreen.tsx` — offer card with countdown, accept/reject, WS emit
- `app_taixe/app/PickupNavigationScreen.tsx` — map route to pickup, "Tôi đã đến" button
- `app_taixe/app/TripCompleteScreen.tsx` — fare/distance/duration summary, back to home
- `app_taixe/src/api/hooks/useTripActions.ts` — arrivedAtPickup / startTrip / completeTrip

### Modified files
- `app_taixe/app/(tabs)/HomeScreen.tsx` — wired `handleNewOffer` to `router.push('/OfferScreen', params)`; added `useRouter` import
- `app_taixe/app/ActiveTripScreen.tsx` — uses real `tripId` param + `useTripActions` (replaces `useTripSimulation`)
- `app_taixe/src/api/axios/config.ts` — added `ENDPOINTS.TRIP.DRIVER_ARRIVED`, `.START`, `.COMPLETE`
- `app_taixe/src/components/trip/TripStatusSheet.tsx` — `onStartTrip` callback added
- `app_taixe/src/localization/iLocalization.ts` — all T-0070 i18n keys added
- `app_taixe/src/localization/resources/vi.ts` — Vietnamese values
- `app_taixe/src/localization/resources/en.ts` — English values

## Navigation Flow

```
HomeScreen (online, waiting for WS offer)
  ↓ driver.new_offer → router.push('/OfferScreen', payload as string params)
OfferScreen (countdown, accept/reject)
  ↓ accept → emit driver.offer_response → wait booking.driver_assigned → tripId
PickupNavigationScreen (map route to pickup)
  ↓ "Tôi đã đến" → PATCH /trips/:id/driver-arrived
ActiveTripScreen (trip in progress)
  ↓ "Bắt đầu chuyến" → PATCH /trips/:id/start
  ↓ "Hoàn tất" → PATCH /trips/:id/complete
TripCompleteScreen (summary)
  ↓ "Về trang chủ" → HomeScreen
```

## API Endpoints Used

| Method | Path | When |
|--------|------|------|
| PATCH | `/api/v1/trips/:id/driver-arrived` | Driver taps "Tôi đã đến" |
| PATCH | `/api/v1/trips/:id/start` | Driver taps "Bắt đầu chuyến" |
| PATCH | `/api/v1/trips/:id/complete` | Driver taps "Hoàn tất" |

## WebSocket Events

- `driver.new_offer` → triggers navigation to OfferScreen
- `driver.offer_response` → emitted by OfferScreen on accept/reject
- `booking.driver_assigned` → received in OfferScreen to get `tripId`

## Checks

- `bunx tsc --noEmit`: PASS (0 errors)
- `bun lint`: PASS (0 errors, 5 pre-existing warnings in unrelated files)
- No files outside Allowed Files modified
- No hardcoded secrets or API keys
- All imports absolute

## Decisions

- `theme.color.state.errorBg` does not exist in `IAppColor` — used hardcoded `'#fee2e2'` for the urgent timer badge background. If the theme is extended with `errorBg`, update `OfferScreen.tsx` line ~202.
- `theme.fontSize.p28` does not exist — used `theme.fontSize.p24` for fare display in OfferScreen.
- `MOCK_DRIVER` constant kept in `ActiveTripScreen` as `TripStatusSheet` requires a driver prop; not removed per contract.
- OfferScreen uses a `responded` ref guard to prevent double-emit on rapid taps.

## Known Limitations

- `OfferScreen` 10s fallback after accept (no `booking.driver_assigned`) silently redirects to HomeScreen — no user feedback shown.
- ActiveTripScreen reads pickup/destination from `ZustandSession.selectedPickup/selectedDestination`; if those are null (e.g., deep-link), route display degrades gracefully to markers-only.

## Next Task

T-0071 — FE app_user: Trip Flow (Looking → Pickup → Dropoff → Complete)
