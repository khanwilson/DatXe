# T-0054.1: Route Display — Bottom Sheet Modal for Booking Content (app_user)

**Status**: Created
**Priority**: P1
**Projects**: app_user
**Depends On**: T-0054 (Route Display with Mapbox, in progress)

---

## Description

After T-0054 displays the route on the map, refactor the route display screen to use a bottom sheet modal for all booking-related content. Keep the map route display intact, but move the summary content (time, booking button, payment method, discount) into a modal.

Reference: `assets/IMG_2571.PNG` (user-provided screenshot of the target UI)

The new route display screen will:
- Show the map with route polyline, origin/destination markers, and camera fit (from T-0054)
- Display a bottom sheet modal with 2 snap points: 70% and 30%
- Inside the modal (70% snap):
  - Vehicle selection list with mock data: vehicle image, vehicle type name, estimated time (from API), real price, discounted price
- Stuck at bottom of modal (always visible):
  - Discount code input/section
  - Payment method display (selected type + settings button "...")
  - Book button

---

## Scope

### In Scope

- Create new `RouteDisplayScreen` component (or modify existing HomeScreen route display)
- Implement bottom sheet modal using `AppBottomSheet` with snapPoints `['70%', '30%']`
- Design and implement modal content:
  - Vehicle type selection list (FlatList) with mock data
  - Each vehicle item: vehicle icon/image, type name, estimated ETA, real price, discounted price
  - Sticky bottom section: discount code, payment method selector, Book button
- Keep existing map route display (polyline, markers, camera fit) from T-0054
- Mock vehicle data (image, name, ETA, price) — API integration later
- Use existing localization pattern for all strings

### Out of Scope

- Real vehicle availability API integration (use mock data)
- Real payment method selection/settings flow
- Real discount code validation
- Turn-by-turn navigation
- Booking confirmation flow
- Modifying files outside app_user project

---

## Acceptance Criteria

- [ ] Map route display (polyline, markers, camera fit) remains functional from T-0054
- [ ] Bottom sheet modal appears with 2 snap points: 70% (expanded) and 30% (collapsed)
- [ ] Vehicle list shows mock data with: vehicle icon, type name, estimated time, real price, discounted price
- [ ] Sticky bottom section shows: discount code area, payment method (selected + settings button), Book button
- [ ] Modal is draggable between snap points
- [ ] TypeScript compiles without errors
- [ ] Lint passes with no new warnings or errors

---

## Technical Notes

### Modal Component

Use existing `AppBottomSheet` component:
- `snapPoints={['70%', '30%']}`
- `enablePanDownToClose={true}`
- Custom content inside

### Vehicle Item Mock Data

```typescript
interface VehicleType {
  id: string;
  name: string; // e.g., "Xe 4 chỗ", "Xe 7 chỗ"
  icon: ImageSource; // vehicle icon
  eta: string; // e.g., "3 phút" (from API in future, mock for now)
  realPrice: number; // e.g., 50000
  discountPrice: number; // e.g., 45000
}
```

### Sticky Bottom Section

Fixed at bottom of modal content:
- Row 1: Discount code input + apply button (or just display mock discount)
- Row 2: Payment method (e.g., "Tiền mặt" + "..." settings button)
- Row 3: Book button (full width, primary color)

### Layout Structure

```
┌─────────────────────────────┐
│     Map (full screen)        │
│  - Route polyline            │
│  - Origin/Dest markers       │
│  - Camera fit to route       │
├─────────────────────────────┤ ← Modal top at 30% snap
│  Vehicle List (scrollable)   │
│  ┌─────────────────────────┐ │
│  │ [icon] Xe 4 chỗ         │ │
│  │ 3 phút   50k    45k     │ │
│  └─────────────────────────┘ │
│  ┌─────────────────────────┐ │
│  │ [icon] Xe 7 chỗ         │ │
│  │ 5 phút   80k    72k     │ │
│  └─────────────────────────┘ │
├─────────────────────────────┤ ← Sticky bottom
│ 🎫 Giảm giá: [________] [+] │
│ 💵 Tiền mặt          [...]  │
│ [      ĐẶT XE      ]        │
└─────────────────────────────┘
```

---

## Files to Touch (candidate Allowed Files)

- `app_user/app/(tabs)/HomeScreen.tsx` (modify route display section)
- `app_user/src/components/map/AppMap.tsx` (keep as is from T-0054)
- `app_user/src/components/modal/AppBottomSheet.tsx` (use as is)
- `app_user/src/components/modal/AppPopup.tsx` (use as is)
- New files:
  - `app_user/src/components/route/VehicleTypeItem.tsx` (vehicle list item component)
  - `app_user/src/components/route/RouteBookingModal.tsx` (bottom sheet modal content)

---

## Dependencies

- Existing `@gorhom/bottom-sheet` (already installed)
- Existing vehicle/map icons from `src/assets/`
- Existing theme system for styling

---

## Constraints

1. Follow existing component patterns (import → variables → component → stylesheet → export)
2. Use `AppBottomSheet` for the modal
3. Use absolute imports only
4. Do not add `console.log` statements
5. Follow TypeScript strict mode
6. Keep map functionality from T-0054 intact
7. Mock vehicle data — no API integration yet
