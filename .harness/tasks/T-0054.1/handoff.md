# T-0054.1 Handoff

**Status**: Done
**Completed**: 2026-07-03

---

## Summary

Implemented a bottom sheet modal for the route booking flow in `app_user`. The old route summary card (distance/duration) has been replaced with a draggable bottom sheet containing a vehicle selection list and sticky booking controls.

## Files Changed

### Created
- `app_user/src/components/route/VehicleTypeItem.tsx` — Vehicle list item component (icon, name, ETA, real price, discount price)
- `app_user/src/components/route/RouteBookingModal.tsx` — Bottom sheet modal wrapping AppBottomSheet with vehicle FlatList + sticky bottom section

### Modified
- `app_user/app/(tabs)/HomeScreen.tsx` — Replaced route summary card with RouteBookingModal, added mock vehicle data, added booking state
- `app_user/src/localization/iLocalization.ts` — Added 3 booking string keys
- `app_user/src/localization/resources/en.ts` — Added English booking strings
- `app_user/src/localization/resources/vi.ts` — Added Vietnamese booking strings

## Test / Build Status

- TypeScript: PASS (no errors)
- Lint: PASS (no new errors; pre-existing warnings unchanged)

## Known Issues

- Vehicle icons use `img_fallback.png` placeholder — needs real vehicle images
- Discount code and payment method are display-only (mock), no real logic
- `react-hooks/exhaustive-deps` warning on HomeScreen useEffect is pre-existing (intentional pattern from T-0054)

## Next Steps

- Add real vehicle type images/icons
- Wire vehicle selection to pricing API
- Implement discount code validation
- Implement payment method selection flow
- Add booking confirmation screen
