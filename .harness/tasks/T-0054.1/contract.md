# T-0054.1 Contract

**Phase**: Contracting → Implementing
**Model**: claude-opus-4-6 (Implementing)

---

## Scope

Refactor HomeScreen route display to use a bottom sheet modal for booking content. Keep map route display intact.

## Allowed Files

### Modified
- `app_user/app/(tabs)/HomeScreen.tsx`
- `app_user/src/localization/iLocalization.ts`
- `app_user/src/localization/resources/en.ts`
- `app_user/src/localization/resources/vi.ts`

### Created
- `app_user/src/components/route/VehicleTypeItem.tsx`
- `app_user/src/components/route/RouteBookingModal.tsx`

## Out of Scope

- Real vehicle API integration
- Real payment/discount flow
- Booking confirmation
- app_taixe, nestjs_prisma
- AppBottomSheet.tsx (use as-is)
- AppMap.tsx (use as-is)

## Acceptance Criteria

- [ ] Map route display (polyline, markers, camera fit) remains functional
- [ ] Bottom sheet modal appears with snapPoints `['70%', '30%']`
- [ ] Vehicle list shows mock data: vehicle icon, type name, ETA, real price, discount price
- [ ] Sticky bottom: discount code area, payment method row, Book button
- [ ] Modal draggable between snap points
- [ ] TypeScript compiles without errors
- [ ] Lint passes

## Implementation Constraints

- Absolute imports only (no `../`)
- Follow TSX file structure: imports → variables/types → component → stylesSheet → export
- `useMemo(() => stylesSheet(theme), [theme])` pattern
- `stylesSheet` function declared after component
- `AppText` instead of RN `Text`
- No `console.log`
- No new external dependencies
