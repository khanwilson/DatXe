# Contract

**Task ID**: T-0035
**Phase**: Contracting
**Created**: 2026-06-30
**Approved**: [ ] Yes / [ ] No

---

## Scope

### In Scope

1. **Destination Search Interface** - Wire the "Where to?" search bar from T-0034 to actual place search functionality using the backend `/routes/*` APIs.
   - Create searchable dropdown/modal for place suggestions
   - Implement place selection with visual markers on the map
   - Display route polyline between locations

2. **Booking Confirmation Screen** - Display ride details, estimated fare, driver info, vehicle info, and payment options.
   - Show pickup and dropoff addresses
   - Display estimated fare calculation
   - Show estimated time of arrival (ETA) for driver
   - Display driver information and vehicle details
   - Allow selection of service type (standard, premium, etc.)

3. **Payment Flow** - Implement the payment selection and processing UI flow.
   - Display available payment methods (Cash, Card, Wallet)
   - Handle payment method selection
   - Show final price breakdown
   - Handle booking confirmation and submission

4. **API Service Layer** - Create service layer to interface with backend routing APIs:
   - `PlacesService` for autocomplete and place details
   - `RoutesService` for directions and geocoding
   - Error handling and response transformation

5. **State Management** - Implement booking context to manage:
   - Pickup/dropoff locations
   - Selected route and ETA
   - Fare estimation
   - Driver/vehicle info
   - Payment method selection

6. **Navigation Flow** - Set up proper navigation between screens:
   - Home → Search → Booking Confirmation → Payment → Success
   - Back navigation support
   - State persistence between screens

7. **i18n Integration** - Add all new strings to localization files.

### Out of Scope

1. **Actual Payment Processing** - Backend responsibility, UI only
2. **Backend API Implementation** - Already handled in T-0031 and future backend tasks (T-0008, T-0011)
3. **Driver-side Implementation** - app_taixe responsibility
4. **Real-time Tracking** - Deferred to later tasks (T-0036, T-0026)
5. **Ride History Management** - Deferred to later tasks (T-0037)
6. **API Client Infrastructure** - Dependent on T-0014; will stub API calls until then
7. **Authentication/API Token Management** - Assumed to be handled by existing authService from T-0033

---

## Allowed Files

```
app_user/src/services/**                            # new: API service layer for routing endpoints
app_user/src/context/**                             # new: booking context/state management
app_user/src/components/booking/**                  # new: booking-specific UI components
app_user/src/components/map/**                      # existing: extend map components with route rendering
app_user/app/search/**                              # new: search screens and modals
app_user/app/booking/**                             # new: booking confirmation screens
app_user/app/payment/**                             # new: payment flow screens
app_user/src/localization/**                        # existing: add new string resources
app_user/src/types/**                               # new: type definitions for booking flow
.harness/tasks/T-0035/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

**Rationale**: This task focuses on the booking flow in app_user only, building on existing components from T-0034. All new functionality is contained within app_user and follows the established patterns.

If implementation needs a file outside this list (e.g., root-level configurations, major architecture changes), **stop and ask** first.

---

## Impacted Projects

- [x] app_user
- [ ] app_taixe
- [ ] nestjs_prisma
- [x] harness

---

## Acceptance Criteria

- [ ] Destination search functionality connected to backend Places API (`/api/v1/routes/places/autocomplete`)
- [ ] Visual representation of route on map with pickup/dropoff markers and polyline
- [ ] Booking confirmation screen with fare estimate and driver info
- [ ] Payment selection UI with multiple payment options
- [ ] Proper navigation flow between all screens
- [ ] `npx tsc --noEmit` clean; `bun lint` clean
- [ ] Theme-consistent UI with Mai Linh semantic tokens
- [ ] i18n support for all user-facing strings ( Vietnamese and English)
- [ ] No hardcoded colors; no hardcoded secrets
- [ ] Loading states and error handling for API calls
- [ ] All changes within Allowed Files

---

## API Contracts

### Backend Endpoints (from T-0031)

| Endpoint | Method | Purpose | Required Parameters |
|----------|--------|---------|-------------------|
| `/api/v1/routes/places/autocomplete` | GET | Autocomplete address search | `query` (string) |
| `/api/v1/routes/places/:placeId` | GET | Get place details | `placeId` (string) |
| `/api/v1/routes/directions` | POST | Calculate route between origin/destination | `origin`, `destination` (strings) |
| `/api/v1/routes/geocode` | POST | Convert coordinates to address | `lat`, `lng` (numbers) |

### Response Formats

All responses follow standard format:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "meta": { "requestId": "uuid" }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "meta": { "requestId": "uuid" }
}
```

---

## Database Impact

None. This task implements frontend UI only. No database schema changes required.

---

## Test Strategy

### Code Quality
- TypeScript compilation: `npx tsc --noEmit`
- Linting: `bun lint`
- No hardcoded colors/secrets (grep check)

### Manual Testing
- End-to-end flow: Home → Search → Booking → Payment
- Error scenarios: API failures, no results, etc.
- Edge cases: Network offline, location permission denied
- Visual verification of all screens on different devices

### Reuse Validation
- Existing components reused: `AppMap`, `SearchPanel`, `useCurrentLocation`
- Theme consistency with Mai Linh tokens
- i18n pattern compliance

---

## Dependency Strategy

### Current (✅ Available)
- T-0034: Home screen with map components
- T-0031: Backend routing APIs

### Future (⬜ Pending)
- T-0014: API client (will stub until available)
- T-0008: Booking APIs (will stub until available)
- T-0011: Payment APIs (will stub until available)

Implementation will use stub/fake data for backend calls that depend on incomplete dependencies.

---

## Sign-off

- **Planner**: FRIDAYAIX
- **Approved**: [ ] Yes / [ ] No
- **Approved At**: -