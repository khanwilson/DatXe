# T-0036 Contract — Active trip tracking with routing (app_user)

**Phase**: Contracting
**Model**: Sonnet (contracting)
**Depends On**: T-0035, T-0050 (both provide reusable infra already in-tree)
**Status**: Accepted (plan approved by user 2026-07-06)

---

## 1. Scope

Implement a mocked **active trip tracking** flow in app_user, reached after
`onBook` in the booking modal:

- New route screen `app/ActiveTripScreen.tsx` following a mocked ride through
  5 lifecycle states: `FINDING → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED`.
- Trip simulation hook that owns lifecycle + driver position, isolated so a
  realtime WebSocket feed (T-0026/T-0028) can replace it without UI rework.
- Status-aware bottom card (driver info, ETA, call/message no-op UI, cancel,
  completion summary).
- Additive `driver` marker prop on `AppMap`.
- Navigation wiring from `BookingRouteScreen.onBook` → `ActiveTripScreen`,
  carrying the selected vehicle id + fare.
- i18n (en + vi), Mai Linh theme tokens, Reanimated for marker animation.

## 2. Out of Scope

- Real WebSocket driver location / realtime status (T-0026, T-0027, T-0028).
- Backend booking/trip/payment APIs (T-0008, T-0010, T-0011).
- Ride history / receipt persistence (T-0037).
- app_taixe driver side.
- Turn-by-turn navigation, alternative routes.
- Real dialer / SMS wiring for call/message buttons.
- Payment/rating screen after completion (completion returns to Home).

## 3. Allowed Files

**New**
- `app_user/app/ActiveTripScreen.tsx`
- `app_user/src/constants/trip.ts`
- `app_user/src/components/trip/useTripSimulation.ts`
- `app_user/src/components/trip/TripStatusSheet.tsx`

**Modified**
- `app_user/src/components/map/AppMap.tsx` (add additive `driver` marker prop only)
- `app_user/app/_layout.tsx` (register `ActiveTripScreen`)
- `app_user/app/BookingRouteScreen.tsx` (navigate on `onBook`)
- `app_user/src/localization/resources/en.ts` (add trip keys)
- `app_user/src/localization/resources/vi.ts` (add trip keys)
- `app_user/src/localization/iLocalization.ts` (declare new keys in interface)

Any file outside this list requires stopping and asking for scope expansion.

## 4. Acceptance Criteria

- [ ] `ActiveTripScreen` reachable from `BookingRouteScreen` `onBook`.
- [ ] Lifecycle progresses through all 5 mocked states with distinct UI per state.
- [ ] Driver marker renders and animates along the route (toward pickup, then
      toward destination).
- [ ] Camera follows the active leg during EN_ROUTE / IN_PROGRESS; fits route on entry.
- [ ] Driver info card: name, rating, vehicle model, plate; carried-over fare/vehicle.
- [ ] Cancel (pre-IN_PROGRESS) → Home + clears trip session fields.
- [ ] Completion summary (fare, distance, duration) → Home on Done.
- [ ] All user-facing strings via i18n, both en + vi, keys typed in `iLocalization`.
- [ ] No hardcoded colors; Mai Linh semantic tokens only.
- [ ] All timers/intervals cleaned up on unmount (no leaks).

## 5. Required Checks

- `npx tsc --noEmit` clean (from `app_user/`).
- `bun lint` clean (from `app_user/`).
- No test runner configured → tests logged as skipped per CLAUDE.md.

## 6. Implementation Constraints

- TSX file order: imports → types/vars → component → `stylesSheet` → export.
- `const styles = useMemo(() => stylesSheet(theme), [theme])`; no inline
  `StyleSheet.create` in component body.
- Absolute imports only; English code comments; no `console.log` (use warn/error).
- Reanimated (`react-native-reanimated`) for animation — no legacy Animated API.
- `AppText`/`AppButton`/`AppTextInput`/`RenderImage` instead of raw RN equivalents.
- `AppMap` change must be strictly additive (optional prop); existing
  `BookingRouteScreen` behavior unchanged.
- Keep the mock/real seam inside `useTripSimulation` only.
- No new dependencies.

## 7. User Approvals

- Plan approved 2026-07-06 (user: "continue").
- Open design question raised in plan review: cancel/complete both return to
  Home (payment/rating deferred to T-0035/T-0037). Proceeding with return-to-Home
  as the accepted default; no objection raised.

## 8. Scope Expansion Log

_(none yet)_
