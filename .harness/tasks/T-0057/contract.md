# T-0057 Contract

## Scope
Redesign the ride booking flow in app_user:
1. HomeScreen becomes a pure ScrollView (no map) with search bar, service icons, banners carousel, nearby grid
2. SearchDestinationScreen enhanced with pickup location change feature
3. New BookingRouteScreen for route map + RouteBookingModal (moved out of HomeScreen)

## Out of Scope
- Backend API changes (no new endpoints)
- Driver app (app_taixe) modifications
- Authentication flow changes
- Payment system modifications
- Notification system changes
- Map SDK changes (keep Mapbox)
- Existing component library changes (AppText, AppButton, etc.)

## Allowed Files

### Modify
- `app_user/app/(tabs)/HomeScreen.tsx` — full rewrite: remove map, become ScrollView-based home
- `app_user/app/SearchDestinationScreen.tsx` — add pickup location change + navigate to BookingRouteScreen
- `app_user/app/_layout.tsx` — register BookingRouteScreen route
- `app_user/src/localization/iLocalization.ts` — new localization keys
- `app_user/src/localization/resources/en.ts` — English strings
- `app_user/src/localization/resources/vi.ts` — Vietnamese strings

### Create
- `app_user/app/BookingRouteScreen.tsx` — new screen: full-screen map + route + RouteBookingModal
- `app_user/src/components/home/HomeSearchBar.tsx` — fake search bar component
- `app_user/src/components/home/ServiceSlider.tsx` — horizontal service icons
- `app_user/src/components/home/BannerCarousel.tsx` — partner banners carousel
- `app_user/src/components/home/NearbyGrid.tsx` — 2-column nearby services grid
- `app_user/src/components/home/NearbyGridItem.tsx` — single grid item

### NOT Allowed (do not touch)
- `app_user/src/components/map/AppMap.tsx` — existing map component (no changes needed)
- `app_user/src/components/map/SearchPanel.tsx` — will be removed from HomeScreen but file stays
- `app_user/src/components/route/RouteBookingModal.tsx` — reused as-is
- `app_user/src/components/route/VehicleTypeItem.tsx` — reused as-is
- Any files in `app_taixe/` or `nestjs_prisma/`

## Acceptance Criteria

### HomeScreen
1. HomeScreen displays a search input view at the top (similar to Grab's design)
2. Tapping the search view navigates to SearchDestinationScreen
3. HomeScreen shows horizontal sliding services as small circular icons
4. HomeScreen includes an "Order Now" slide with banners from partner companies in a carousel
5. HomeScreen displays a list of nearby services/restaurants in a 2-column grid layout
6. Each nearby item shows: image, name, stars, distance
7. HomeScreen has NO map (pure ScrollView)

### SearchDestinationScreen
8. SearchDestinationScreen shows current location (pickup) at top with ability to change
9. Tapping current location opens pickup search (same autocomplete mechanism)
10. After selecting new pickup, return to SearchDestinationScreen with updated pickup
11. Existing destination search functionality is maintained
12. On destination select, navigate to BookingRouteScreen (not router.back())

### BookingRouteScreen
13. BookingRouteScreen shows full-screen map with route polyline
14. Map zooms to show entire route from pickup to destination
15. RouteBookingModal overlays the bottom of the map
16. Map bounds use large paddingBottom so route is visible above the modal
17. Selecting a vehicle type in RouteBookingModal sends an order (mock for now)
18. All transitions between screens are smooth

### Technical
19. Follow existing code conventions (absolute imports, theme system, file structure)
20. Use existing components (AppText, AppMap, RouteBookingModal, VehicleTypeItem)
21. Mock data for services, banners, nearby items (no backend API)
22. Proper TypeScript types
23. Localization for all new strings (en + vi)

## Implementation Constraints
- Use existing navigation patterns (expo-router)
- Maintain compatibility with existing map implementation (Mapbox)
- Follow existing code style and conventions in the codebase
- Use ScrollView + paging for carousel (no new dependencies)
- Implement efficient rendering for lists and grids
- Ensure proper state management for location data (ZustandSession)
- Follow the established file organization structure
- Use absolute imports as per project conventions
- Apply proper styling using the existing theme system
- Ensure components are properly typed with TypeScript

## Required Checks
- Lint: `bun lint` (must pass)
- Typecheck: `bun tsc --noEmit` (must pass)
- No console.log errors
- No TypeScript errors

## User Approvals
- Plan approved on 2026-07-03
- HomeScreen = pure ScrollView (no map)
- BookingRouteScreen = new dedicated screen for route + booking
- Map bounds with large paddingBottom to show route above modal
