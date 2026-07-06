# T-0057 Plan: Rework Ride Booking Flow

## Goal
Redesign the ride booking flow in app_user to create a Grab-like interface with enhanced HomeScreen, SearchDestinationScreen, and BookingRoute flow.

## Current State
- **HomeScreen**: Full-screen map + bottom SearchPanel + recenter FAB + RouteBookingModal + route display via Mapbox
- **SearchDestinationScreen**: Goong autocomplete search → saves destination to ZustandSession → goes back to HomeScreen
- **Flow**: HomeScreen reads destination on focus → fetches directions → shows route + presents booking modal
- **RouteBookingModal**: vehicle list + payment + book button

## What Needs to Change

### Phase 1: HomeScreen Redesign — NO MAP
The current HomeScreen is a full-screen map. After redesign, HomeScreen becomes a **ScrollView-based screen** with NO map at all:

1. **Search input view at top** — a fake search bar (similar to Grab). Tapping navigates to SearchDestinationScreen.
2. **Horizontal sliding services** — below search bar, small circular icons for "Đặt xe", "Giao hàng", "Đi chợ", etc. ScrollView horizontal.
3. **Banners carousel** — "Đặt ngay" section with partner company banners. Rectangular with rounded corners, full width, 1:2 ratio (width:height ≈ 2:1). Swipe carousel.
4. **Nearby services grid** — 2-column FlatList/ScrollView with establishment cards (image, name, stars, distance).

### Phase 2: SearchDestinationScreen Enhancement
Add ability to change pickup location:
1. Show current location (pickup point) at top with "change" option
2. Tapping current location opens a location search (same autocomplete mechanism)
3. After selecting new pickup, return to SearchDestinationScreen with updated origin

### Phase 3: BookingRouteScreen (NEW SCREEN)
When user selects a destination in SearchDestinationScreen, navigate to a new **BookingRouteScreen** instead of going back to HomeScreen.

This screen shows:
1. **Full-screen map** with route polyline from pickup to destination
2. **Map zooms to fit entire route** with proper padding so route is visible above the RouteBookingModal
3. **RouteBookingModal** overlays the bottom of the map
4. **Map camera adjustment**: The map bounds padding is increased (especially `paddingBottom`) so the route line is not hidden behind the modal — the visible route area shifts upward
5. After selecting vehicle type in RouteBookingModal, send order to server (mock for now)

Key difference from current approach:
- Currently: HomeScreen conditionally shows route + modal
- New: Dedicated BookingRouteScreen handles all route visualization + booking

## Implementation Approach

### New Components to Create
- `app_user/src/components/home/HomeSearchBar.tsx` — fake search bar for top of home
- `app_user/src/components/home/ServiceSlider.tsx` — horizontal service icons
- `app_user/src/components/home/BannerCarousel.tsx` — partner banners carousel
- `app_user/src/components/home/NearbyGrid.tsx` — 2-column nearby services grid
- `app_user/src/components/home/NearbyGridItem.tsx` — single grid item

### New Screen to Create
- `app_user/app/BookingRouteScreen.tsx` — dedicated screen for route map + RouteBookingModal

### Files to Modify
- `app_user/app/(tabs)/HomeScreen.tsx` — full rewrite: remove map, become ScrollView-based home
- `app_user/app/SearchDestinationScreen.tsx` — add pickup location change feature + navigate to BookingRouteScreen on destination select (instead of router.back())
- `app_user/app/_layout.tsx` — register BookingRouteScreen route
- `app_user/src/localization/resources/en.ts` — new strings
- `app_user/src/localization/resources/vi.ts` — new strings
- `app_user/src/localization/iLocalization.ts` — new keys

### Approach Details

**HomeScreen (no map):**
- Pure ScrollView: HomeSearchBar → ServiceSlider → BannerCarousel → NearbyGrid
- Tapping search bar → navigates to SearchDestinationScreen
- No map, no route data, no RouteBookingModal

**SearchDestinationScreen:**
- Existing autocomplete search preserved
- Add pickup location row above search input (shows current GPS address)
- Tapping pickup row → toggle to "pickupSearch" mode (same autocomplete, saves as pickup)
- On destination select → navigate to BookingRouteScreen (not router.back())

**BookingRouteScreen (new):**
- Receives pickup + destination via route params or ZustandSession
- Full-screen Mapbox map with route polyline
- Fetches directions (useDirections hook)
- Map bounds with large `paddingBottom` so route displays above the modal
- RouteBookingModal at bottom (vehicle list + payment + book)
- Vehicle select → mock order dispatch

**Mock data:** Services, banners, and nearby items will use mock/placeholder data since backend APIs don't exist yet.

## Risks
- HomeScreen becomes significantly more complex with dual-mode rendering
- No backend for services/banners/nearby — all mock data
- Carousel implementation needs smooth UX without adding heavy deps (will use ScrollView + paging)

## Model Routing
- Planning: Sonnet (this phase)
- Implementing: Opus (complex multi-file changes)
- Evaluating/Reviewing: Sonnet

## Acceptance Criteria Mapping
1. ✅ HomeScreen search input view at top → HomeSearchBar (ScrollView, no map)
2. ✅ Tapping search navigates to SearchDestinationScreen → onPress handler
3. ✅ Horizontal sliding services → ServiceSlider
4. ✅ Banners carousel → BannerCarousel
5. ✅ Nearby services 2-column grid → NearbyGrid
6. ✅ SearchDestinationScreen change current location → pickup change feature
7. ✅ SearchDestinationScreen maintains existing search → existing code preserved
8. ✅ Selecting destination opens BookingRouteScreen → navigate to new screen
9. ✅ BookingRouteScreen: map zooms to show entire route above modal → bounds with large paddingBottom
10. ✅ Vehicle type → order to server → onBook handler (mock for now)
11. ✅ Smooth transitions → proper navigation between screens
12. ✅ Existing functionality maintained → search, autocomplete, directions preserved
