# T-0053 — Plan: Goong Places Autocomplete Integration (app_user)

## Task Goal

Implement place search (autocomplete + place detail) for the "Where to?" flow in app_user. When user taps the search bar on HomeScreen, open a search screen that calls Goong Places Autocomplete as user types, shows predictions, and on tap fetches Place Detail (lat/lng) then navigates back with the selected destination.

## Requirements

- Search screen opens on tap "Where to?"
- Typing triggers debounced autocomplete (300ms)
- Results show place name (main text) + address (secondary text)
- Selecting a result fetches lat/lng via Place Detail
- Selected destination passed back to HomeScreen (lat, lng, name, address)
- Loading / empty / error states handled
- Vietnamese locale results by default
- TypeScript compiles, lint passes

## Approach: Route through backend `/routes/*` endpoints

Call backend `GET /routes/places/autocomplete?query=...` and `GET /routes/places/:placeId` rather than Goong directly. Benefits:
- Goong API key stays server-side (not embedded in mobile bundle)
- Backend already caches autocomplete (5 min) and place detail (1 hour) in Redis
- Consistent with existing API architecture

## Proposed Changes

### 1. API layer (`src/api/`)

**`src/api/axios/config.ts`** — Add ROUTES endpoints:
```
ROUTES: {
  AUTOCOMPLETE: '/routes/places/autocomplete',
  PLACE_DETAIL: '/routes/places',  // + /:placeId
}
```

**`src/api/services/goongPlaceService.ts`** — New service:
- `autocomplete(query, location?)` → `GET /routes/places/autocomplete?query=...&language=vi`
- `placeDetail(placeId)` → `GET /routes/places/:placeId`
- Types: `PlacePrediction`, `PlaceDetail`, response shapes

**`src/api/hooks/useGoongPlace.ts`** — New hooks (TanStack Query):
- `useAutocomplete(query, location?)` — enabled when query.length >= 2, staleTime 5 min
- `usePlaceDetail(placeId)` — enabled only when placeId is set

**`src/api/services/index.ts`** — Re-export new service
**`src/api/hooks/index.ts`** — Re-export new hooks (if exists)
**`src/api/index.ts`** — Re-export new modules

### 2. Search screen (`app/`)

**`app/SearchDestinationScreen.tsx`** — New Expo Router screen:
- Search input at top (AppTextInput, auto-focus)
- Back button (CustomHeader pattern)
- FlatList of predictions (main text + secondary text)
- Loading spinner while fetching
- Empty state when no results
- Error state with retry
- On tap result → fetch place detail → `router.back()` with params
- Debounce input 300ms via `Closure.debounce`
- Pass current user location for bias (from route params or optional)

### 3. Navigation wiring

**`app/(tabs)/HomeScreen.tsx`** — Update `handleSearch`:
- `router.push('/SearchDestinationScreen')` 
- Listen for result via route params or a callback pattern

Since Expo Router doesn't have a built-in "navigate back with data" pattern for non-stack screens, use a simple approach: pass destination data back via Expo Router params. HomeScreen reads the param on focus.

Alternative: Use a lightweight event/callback via a zustand session store or URL params.

**Recommended approach**: Use Expo Router's `router.push` with params, and HomeScreen uses `useFocusEffect` to read the destination param.

### 4. Localization

**`src/localization/resources/vi.ts`** + **`en.ts`** — Add keys:
- `searchDestinationTitle` — "Tìm điểm đến" / "Find destination"
- `searchDestinationPlaceholder` — "Nhập địa chỉ" / "Enter address"
- `searchNoResults` — "Không tìm thấy kết quả" / "No results found"
- `searchError` — "Lỗi khi tìm kiếm" / "Search error"
- `searchRetry` — "Thử lại" / "Retry"

### 5. Types

Define in `src/api/services/goongPlaceService.ts`:
```typescript
interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlaceDetail {
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  phoneNumber?: string;
}

// Route params for passing destination back
interface DestinationResult {
  lat: number;
  lng: number;
  name: string;
  address: string;
}
```

## Files to Create
1. `app_user/src/api/services/goongPlaceService.ts`
2. `app_user/src/api/hooks/useGoongPlace.ts`
3. `app_user/app/SearchDestinationScreen.tsx`

## Files to Modify
1. `app_user/src/api/axios/config.ts` — Add ROUTES endpoints
2. `app_user/src/api/services/index.ts` — Re-export
3. `app_user/src/api/index.ts` — Re-export
4. `app_user/app/(tabs)/HomeScreen.tsx` — Wire handleSearch + read result
5. `app_user/src/localization/resources/vi.ts` — Add keys
6. `app_user/src/localization/resources/en.ts` — Add keys
7. `app_user/src/localization/iLocalization.ts` — Add type keys (if exists)

## Out of Scope
- Route calculation / display (T-0054)
- Backend changes (done in T-0050)
- Booking confirmation flow
- Saved places persistence (home/work shortcuts)

## Risk
- **Low**: All backend endpoints already exist and are tested
- **Low**: No new dependencies needed (TanStack Query already installed)
- **Medium**: "Navigate back with data" pattern — Expo Router doesn't have a clean modal-result API; need to pick the right approach (params vs zustand session)

## Model
- Planning: Sonnet (this plan)
- Implementing: Opus (per harness routing)
- No architecture boundary — single project, clear scope
