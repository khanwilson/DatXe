# T-0035: Booking confirmation & payment UI app_user

**Title**: Booking confirmation & payment UI app_user
**Created**: 2026-06-30
**Priority**: P0
**Projects**: app_user
**Depends On**: T-0034 (map home screen), T-0031 (routing backend)

---

## Requirement

Build the booking confirmation and payment UI flow for app_user. This includes:

1. **Destination Search Interface** - Wire the "Where to?" search bar from T-0034 to actual place search functionality using the backend `/routes/*` APIs.
2. **Booking Confirmation Screen** - Display ride details, estimated fare, driver info, vehicle info, and payment options.
3. **Payment Flow** - Implement the payment selection and processing UI flow.

### Destination Search
- Wire `SearchPanel.onPressSearch` to actual place search using backend Places autocomplete API.
- Implement a searchable dropdown/modal for place suggestions.
- Select pickup/dropoff locations with visual markers on the map.
- Show route polyline between locations.

### Booking Confirmation
- Display pickup and dropoff addresses
- Show estimated fare calculation
- Display estimated time of arrival (ETA) for driver
- Show driver information and vehicle details
- Allow selection of service type (standard, premium, etc.)

### Payment Flow
- Display available payment methods (Cash, Card, Wallet)
- Handle payment method selection
- Show final price breakdown
- Handle booking confirmation and submission

---

## Context

- T-0034 delivered the foundation Home screen with `AppMap`, `SearchPanel`, and `useCurrentLocation`.
- T-0031 delivered backend routing endpoints (`/routes/*`) including places, geocode, and directions.
- app_user is using Expo Router with tab navigation structure.
- Theme Mai Linh semantic tokens are in place.
- TypeScript strict mode, bun package manager.
- Reusable components: `AppMap`, `SearchPanel`, `useCurrentLocation`.

## Assumptions

- Backend APIs at `/api/v1/routes/*` are available (delivered in T-0031)
- User is authenticated and has valid JWT token
- Map components from T-0034 are available for reuse
- Payment processing will be implemented at the frontend UI level (actual payment processing is backend responsibility)

## Out of Scope

- Backend API implementation (handled in T-0031)
- Actual payment processing (backend)
- Driver-side implementation (app_taixe)
- Real-time tracking (deferred to later tasks)
- Ride history and booking management

## Success Criteria

- [ ] Destination search functionality connected to backend Places API
- [ ] Visual representation of route on map with pickup/dropoff markers
- [ ] Booking confirmation screen with fare estimate and driver info
- [ ] Payment selection UI with multiple payment options
- [ ] Proper navigation flow between all screens
- [ ] `npx tsc --noEmit` clean; `bun lint` clean
- [ ] Theme-consistent UI with Mai Linh semantic tokens
- [ ] i18n support for all user-facing strings

---

**Created**: 2026-06-30
**Phase**: Created
**Status**: Planned