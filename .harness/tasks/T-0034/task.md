# T-0034: Home & map taxi search (app_user)

**Title**: Home & map taxi search app_user
**Created**: 2026-06-29
**Priority**: P0
**Projects**: app_user
**Depends On**: T-0031 (routing backend), T-0033 (auth flow)

---

## Requirement

Build the Home screen for app_user (the first screen after login): a full-screen map with the
user's current location, and a "where to?" search-bar UI that opens the booking entry point.
This is the demo-ready landing for the booking flow.

### Map
- Real map via **react-native-maps** with `PROVIDER_GOOGLE` on **both** iOS and Android.
- Configured through the Expo config plugin + **development build** (NOT Expo Go).
- Google Maps SDK API keys (Android + iOS) wired via `app.json` plugin config (read from env, no hardcoded key).
- Centers on the user's current location; shows a current-location marker.
- Recenter ("my location") button using `expo-location`.

### Search (UI + current location only)
- A "Where to?" search bar / card overlaid on the map (tap target → booking entry; actual
  place-search results wiring deferred to T-0035).
- Saved-place shortcuts row (Home / Work placeholders) — static UI this task.
- Current location resolved + (optionally) reverse-geocoded label via backend `/routes/geocode`
  is **out of scope** here; only the GPS coordinate + marker are required.

---

## Context

- T-0031 delivered backend routing endpoints (`/routes/*`); app_user has **no routes API client yet**.
  This task does NOT build the full search client — that lands in the booking task (T-0035).
- app_user is **Expo managed** (no native folders committed), New Arch enabled, SDK ~54.
- `react-native-maps` needs native modules → requires `expo prebuild` / EAS dev client; Expo Go
  no longer works after this task. This is an accepted, deliberate shift (user decision 2026-06-29).
- Theme Mai Linh semantic tokens (T-0046); TSX file-order + `stylesSheet(theme)` + `useMemo` pattern.

## Assumptions

- Default map region falls back to a VN city center (e.g. Ho Chi Minh City) before GPS resolves
  or if location permission denied.
- Location permission already requested in onboarding (T-0032.2); Home re-checks at point of use
  and degrades gracefully (shows fallback region + enables button to request again).
- Google Maps API keys provided via env / EAS secrets; placeholders documented, never committed.

## Out of Scope

- Live place autocomplete / geocode API calls (T-0035 booking).
- Driver pins, pickup/dropoff pins, route polyline rendering (later booking/trip tasks).
- Booking creation, fare estimate, payment.
- app_taixe, backend changes, Prisma.
- Actually running an EAS build (config + code only; build is user-run).

## Success Criteria

- [ ] `react-native-maps` installed + Expo config plugin set up for `PROVIDER_GOOGLE` (iOS + Android).
- [ ] API keys read from env/config, not hardcoded.
- [ ] HomeScreen renders a Google map, centered on current location (fallback region if no GPS).
- [ ] "My location" recenter button works via expo-location.
- [ ] "Where to?" search bar + saved-place shortcuts UI present, themed (no hardcoded colors).
- [ ] Graceful handling when location permission denied.
- [ ] `npx tsc --noEmit` clean; `bun lint` clean.

---

**Created**: 2026-06-29
**Phase**: Created
**Status**: Planned
