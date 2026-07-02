# T-0053 — Contract

## Scope

Implement Goong Places Autocomplete search screen for app_user. User taps "Where to?" on HomeScreen → opens SearchDestinationScreen → types → debounced autocomplete via backend → shows predictions → taps result → fetches place detail (lat/lng) → navigates back with destination data.

## Out of Scope

- Route calculation / display (T-0054)
- Backend changes (done in T-0050)
- Booking confirmation flow
- Saved places persistence
- app_taixe changes
- nestjs_prisma changes

## Allowed Files

### Create
1. `app_user/src/api/services/goongPlaceService.ts`
2. `app_user/src/api/hooks/useGoongPlace.ts`
3. `app_user/app/SearchDestinationScreen.tsx`

### Modify
1. `app_user/src/api/axios/config.ts` — Add ROUTES endpoints
2. `app_user/src/api/services/index.ts` — Re-export goongPlaceService
3. `app_user/src/api/index.ts` — Re-export new modules
4. `app_user/app/(tabs)/HomeScreen.tsx` — Wire handleSearch + read result param
5. `app_user/src/localization/resources/vi.ts` — Add search keys
6. `app_user/src/localization/resources/en.ts` — Add search keys
7. `app_user/src/localization/iLocalization.ts` — Add type keys

## Acceptance Criteria

- [ ] Search screen opens on tap "Where to?"
- [ ] Typing triggers debounced Goong autocomplete (300ms debounce)
- [ ] Results show mainText + secondaryText
- [ ] Selecting a result fetches lat/lng from Place Detail
- [ ] Selected destination passed back to HomeScreen (lat, lng, name, address)
- [ ] Loading / empty / error states handled
- [ ] Vietnamese locale results by default (`language=vi`)
- [ ] TypeScript compiles (`tsc --noEmit`)
- [ ] Lint passes (`bun lint`)

## Implementation Constraints

- Call backend `/routes/places/autocomplete` and `/routes/places/:placeId` (not Goong directly)
- Use TanStack Query for data fetching (already installed)
- Use `Closure.debounce` for input debouncing (already exists)
- Use `AppText` and `AppTextInput` (project convention)
- Use `stylesSheet(theme)` + `useMemo` pattern for styles
- Absolute imports only (no `../`)
- English code comments
- Follow file structure: imports → types → component → stylesheet → export

## Required Checks

- `tsc --noEmit` — must pass
- `bun lint` — must pass
