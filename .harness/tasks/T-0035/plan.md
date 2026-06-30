# Plan

**Task ID**: T-0035
**Title**: Booking confirmation & payment UI app_user
**Phase**: Planning
**Created**: 2026-06-30

---

## Analysis

### Affected Projects
- [x] app_user (primary)
- [ ] app_taixe
- [ ] nestjs_prisma
- [ ] harness

### Complexity
Medium - Building multiple interconnected UI screens with backend API integration

### Dependencies
- ✅ T-0034 (Home screen with map components)
- ✅ T-0031 (Routing backend APIs)
- ⬜ T-0014 (API client - needed for backend communication)
- ⬜ T-0006/T-0008/T-0011 (Backend booking/payment APIs - needed for actual submission)

### Risks
1. **API Integration Risk** - Need to understand and integrate with backend routing APIs from T-0031
2. **Navigation Complexity** - Multiple screens with complex navigation flow between them
3. **State Management** - Managing booking state between screens (pickup, dropoff, route, fare, payment)
4. **Map Integration** - Rendering route polylines and markers correctly
5. **Dependency Gap** - Missing API client (T-0014) and backend booking APIs (T-0008, T-0011) needed for complete functionality

### Mitigation Strategy
1. Build reusable API service layer for routing endpoints
2. Use Expo Router's built-in navigation patterns
3. Implement centralized booking state with React Context or lightweight state management
4. Create modular map components for route/polylines
5. Stub backend APIs until T-0014 and backend tasks are completed

---

## Approach

### 1. API Service Layer
Create service layer to interface with backend routing APIs:
- `PlacesService` for autocomplete and place details
- `RoutesService` for directions and geocoding
- Error handling and response transformation

### 2. State Management
Implement booking context to manage:
- Pickup/dropoff locations
- Selected route and ETA
- Fare estimation
- Driver/vehicle info
- Payment method selection

### 3. Search Flow
Wire SearchPanel to places autocomplete:
- Create search modal/component for place selection
- Display autocomplete suggestions
- Handle place selection and geocoding
- Update map with markers for selected locations

### 4. Route Visualization
Display route on map:
- Fetch directions between pickup/dropoff
- Render route polyline on AppMap
- Display ETA and distance information

### 5. Booking Confirmation Screen
Create screen to display:
- Pickup/dropoff addresses
- Route visualization on map
- Estimated fare
- Service type selection
- Driver/vehicle mock info

### 6. Payment Flow
Implement payment selection UI:
- Display available payment methods
- Handle payment method selection
- Show price breakdown
- Confirm booking submission

### 7. Navigation Flow
Set up proper navigation between screens:
- Home → Search → Booking Confirmation → Payment → Success
- Back navigation support
- State persistence between screens

### 8. i18n Integration
Add all new strings to localization files.

---

## Implementation Steps

### Phase 1: Foundation
1. Create API service layer for routing endpoints
2. Implement booking context/state management
3. Add new string resources to i18n

### Phase 2: Search Flow
4. Create place search modal/component
5. Wire SearchPanel.onPressSearch to search functionality
6. Implement autocomplete suggestions display
7. Handle place selection and geocoding
8. Update map with location markers

### Phase 3: Route Visualization
9. Fetch directions between locations
10. Create route polyline component
11. Display ETA and distance information
12. Integrate route display with existing AppMap

### Phase 4: Booking Confirmation
13. Create booking confirmation screen
14. Display pickup/dropoff addresses
15. Integrate map with route visualization
16. Show estimated fare and service options
17. Add mock driver/vehicle information

### Phase 5: Payment Flow
18. Create payment method selection UI
19. Implement payment confirmation flow
20. Add price breakdown display
21. Handle booking submission (stub backend calls)

### Phase 6: Navigation & Polish
22. Implement complete navigation flow
23. Add loading states and error handling
24. Ensure theme consistency and accessibility
25. Final UI polish and responsiveness

---

## Testing Strategy

### Unit Tests
- API service functions
- Booking context reducers
- Utility functions for distance/time calculations

### Integration Tests
- Search flow integration with backend APIs
- Map component with route rendering
- Navigation between booking screens

### Manual Testing
- End-to-end flow: Home → Search → Booking → Payment
- Error scenarios: API failures, no results, etc.
- Edge cases: Network offline, location permission denied
- Visual verification of all screens on different devices

### Code Quality Checks
- TypeScript compilation: `npx tsc --noEmit`
- Linting: `bun lint`
- No hardcoded colors/secrets
- Theme-consistent styling
- Accessibility considerations

---

## Effort Estimate

**Total**: 12-16 hours

### Breakdown:
- API Service Layer: 2 hours
- State Management: 1 hour
- Search Flow: 3 hours
- Route Visualization: 2 hours
- Booking Confirmation Screen: 2 hours
- Payment Flow: 2 hours
- Navigation & Polish: 2 hours
- Testing & Debugging: 2 hours

---

## Reuse Opportunities

1. **Existing Components**:
   - `AppMap` from T-0034
   - `SearchPanel` from T-0034
   - `useCurrentLocation` from T-0034
   - Theme tokens from T-0046

2. **Patterns**:
   - TSX file structure pattern
   - StyleSheet pattern with useMemo(theme)
   - i18n integration pattern
   - Expo Router navigation patterns

---

## Out of Scope Clarifications

1. **Actual Payment Processing** - Backend responsibility, UI only
2. **Backend API Implementation** - Already handled in T-0031 and future backend tasks
3. **Driver-side Implementation** - app_taixe responsibility
4. **Real-time Tracking** - Deferred to later tasks
5. **Ride History Management** - Deferred to later tasks