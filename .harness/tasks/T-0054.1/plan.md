# T-0054.1 Plan — Route Display Bottom Sheet Modal (app_user)

**Phase**: Planning
**Model**: claude-sonnet-4-6 (frontend-only UI task, no architecture boundary)
**Depends On**: T-0054 (Route Display with Mapbox, in progress)

---

## 1. Goal

Refactor the route display screen to use a bottom sheet modal for all booking-related content while keeping the map route display intact. The modal will have 2 snap points (70% and 30%) and contain:
- Vehicle type selection list (mock data) with ETA, real price, and discounted price
- Sticky bottom section with discount code, payment method, and Book button

Reference: `.harness/tasks/T-0054.1/assets/IMG_2571.PNG`

## 2. Requirements

- Map route display (polyline, markers, camera fit) from T-0054 remains functional
- Bottom sheet modal using `AppBottomSheet` with snapPoints `['70%', '30%']`
- Vehicle list with mock data: icon, type name, ETA (from API or mock), real price, discount price
- Sticky bottom: discount code input, payment method display + settings button, Book button
- Modal is draggable between snap points
- TypeScript compiles; lint passes
- Follow existing component patterns (absolute imports, stylesheet factory)

## 3. Verified Context

**From T-0054**:
- HomeScreen already has route display logic (routeData state, useDirections hook, AppMap with route/markers/bounds)
- AppMap component supports `route`, `origin`, `destination`, `bounds` props
- Route summary card currently shows distance/duration — will be replaced by modal content

**Existing Components**:
- `AppBottomSheet` (`src/components/modal/AppBottomSheet.tsx`): accepts `snapPoints`, `enablePanDownToClose`, themed backdrop
- `AppPopup` (`src/components/modal/AppPopup.tsx`): fullscreen modal (not needed for this task)
- Theme system: `useAppTheme()`, `theme.color.*`, `theme.dimensions.*`
- Localization: `getString()` helper, `en.ts` + `vi.ts` resources

**Package**: `@gorhom/bottom-sheet` already installed (v5.2.8)

## 4. Proposed Approach

### 4.1 Vehicle Type Mock Data
- Create a mock data file or inline constants for vehicle types
- Each vehicle: `id`, `name` (e.g., "Xe 4 chỗ"), `icon` (ImageSource), `eta` (string), `realPrice` (number), `discountPrice` (number)

### 4.2 VehicleTypeItem Component
- New component: `src/components/route/VehicleTypeItem.tsx`
- Props: `vehicle` (VehicleType), `selected` (boolean), `onPress` (callback)
- Layout: icon left, name + ETA center, prices right
- Highlight selected vehicle with border/background

### 4.3 RouteBookingModal Component
- New component: `src/components/route/RouteBookingModal.tsx`
- Uses `AppBottomSheet` with `snapPoints={['70%', '30%']}`
- Structure:
  - Top: scrollable FlatList of VehicleTypeItem
  - Bottom (sticky): discount code row, payment method row, Book button
- Accepts props: `isVisible`, `onClose`, `vehicles`, `selectedVehicle`, `onSelectVehicle`

### 4.4 HomeScreen Integration
- Modify HomeScreen to:
  - Import `RouteBookingModal`
  - Replace route summary card with modal trigger
  - Show modal when route data is available
  - Pass route data (ETA from API, prices) to modal
  - Keep map display unchanged

### 4.5 Localization
- Add strings for:
  - Vehicle type names (can use Vietnamese directly in mock data)
  - "Giảm giá" (discount)
  - "Phương thức thanh toán" (payment method)
  - "Đặt xe" (Book)
  - Error/empty states if needed

## 5. Files to Touch

**Modified:**
- `app_user/app/(tabs)/HomeScreen.tsx` — integrate RouteBookingModal, remove route summary card
- `app_user/src/localization/en.ts` — add route booking strings
- `app_user/src/localization/vi.ts` — add route booking strings

**Created:**
- `app_user/src/components/route/VehicleTypeItem.tsx` — vehicle list item component
- `app_user/src/components/route/RouteBookingModal.tsx` — bottom sheet modal content

**Assets:**
- `.harness/tasks/T-0054..1/assets/IMG_2571.PNG` — reference image (already provided)

## 6. Risks

- **Bottom sheet behavior on different screen sizes**: Test on both iOS and Android
- **Modal overlapping map controls**: Ensure recenter FAB and search panel remain accessible
- **Keyboard handling**: Discount code input should not be obscured by keyboard (use KeyboardAvoidingView if needed)
- **Vehicle icon availability**: May need to use placeholder icons if vehicle images not available

## 7. Out of Scope

- Real vehicle availability API
- Real payment method selection flow
- Real discount code validation
- Booking confirmation
- Modifying files outside app_user project

## 8. Architect / Escalation

Not required. Single module (app_user), no architecture boundary, frontend-only UI task.
