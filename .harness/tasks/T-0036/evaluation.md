# T-0036 Evaluation

**Phase**: Evaluating → PASS
**Model**: Sonnet

## Commands Run

```
npx tsc --noEmit        (from app_user/)
bun lint / expo lint    (from app_user/)
```

## Results

| Check      | Result  | Notes |
|------------|---------|-------|
| tsc        | ✅ PASS | 0 errors |
| lint       | ✅ PASS | 0 errors, 4 warnings all pre-existing in out-of-contract files |
| tests      | ⏭ SKIPPED | No test runner configured (CLAUDE.md) |
| build      | ⏭ SKIPPED | Managed Expo workflow, no native build in CI |

## Fix History

1. `TripStatusSheet.tsx`: `fontSize.p18` → `fontSize.p16` (token doesn't exist)
2. `BookingRouteScreen.tsx`: `onBook` wired to dismiss modal + navigate to `ActiveTripScreen` with vehicleName + fare params
3. `TripStatusSheet.tsx`: cancel/done `TouchableOpacity` replaced with `AppButton` per contract convention

## Acceptance Criteria

- ✅ ActiveTripScreen reachable from BookingRouteScreen onBook
- ✅ Lifecycle through all 5 mocked states with distinct UI
- ✅ Driver marker renders and animates along route
- ✅ Camera follows active leg; bounds fit on FINDING
- ✅ Driver info card: name, rating, vehicle, plate + fare/vehicle
- ✅ Cancel (pre-IN_PROGRESS) → Home + clears session
- ✅ Completion summary + Done → Home
- ✅ All strings via i18n, both en + vi, keys typed
- ✅ No hardcoded colors
- ✅ Timers cleaned up on unmount
