# Plan

**Task ID**: T-0034
**Phase**: Planning
**Created**: 2026-06-29

---

## Analysis

### Scope Clarification

- **Affected Projects**: `app_user` only.
- **Affected Files**:
  1. `package.json` / `bun.lock` — add `react-native-maps`.
  2. `app.json` — add `react-native-maps` config plugin (Google Maps API keys, iOS + Android).
  3. `app/(tabs)/HomeScreen.tsx` — rewrite from stub into the map + search Home.
  4. `src/components/map/*` (new) — extract a reusable `AppMap` wrapper + search bar / shortcuts UI.
  5. `src/hooks/useCurrentLocation.ts` (new) — expo-location permission + position helper.
  6. `src/constants/*` or `src/config` — default fallback region (HCMC) + map constants.
  7. `src/localization/**` — strings ("Where to?", saved places, location-denied notice).
  8. `.env` / `app.config` plumbing for `GOOGLE_MAPS_API_KEY_*` (documented; no real key committed).
- **Estimated Complexity**: **High** — first native module in the project; forces dev-client/prebuild.

### Dependencies

- **Previous Tasks**: T-0031 (routing backend, used later), T-0033 (auth → lands on Home), T-0046 (theme).
- **External**: `react-native-maps` (new, native). `expo-location` (already installed). Google Maps
  SDK keys (Android + iOS) supplied via env/EAS secrets by user.
- **Blocked By**: none for code; **a dev build is required to actually render** the map (user runs it).

### Risks

- **R1 — Leaves Expo Go**: native module means Expo Go stops working; team must use a dev client.
  → Mitigation: document clearly in handoff + PROJECT_STATE; provide prebuild/dev-build commands.
- **R2 — API key handling**: keys must not be committed. → Read from env via `app.config.ts` (or
  `app.json` + EAS secrets); commit only placeholders + docs. Grep for hardcoded keys before close.
- **R3 — New Arch + react-native-maps compat (SDK 54 / RN 0.81)**: pin a version known to support
  New Arch; if incompatible, document and surface to user (do not silently disable newArch).
- **R4 — Location permission denied / GPS slow**: → fallback region (HCMC) + non-blocking; expose a
  button to re-request / open settings. Never block the screen on location.
- **R5 — tsc types for react-native-maps**: ensure types resolve (lib ships its own). Type-check gate.
- **R6 — react-compiler experiment + map ref**: imperative `mapRef.animateToRegion` must still work
  under reactCompiler. → use `useRef`; verify recenter animates.

---

## Implementation Approach

### Step 1: Install + native config
- `bun add react-native-maps` (pin version compatible with Expo SDK 54 / RN 0.81 / New Arch).
- Add config-plugin entry in `app.json` (or migrate to `app.config.ts` if env interpolation needed)
  to inject Google Maps API keys: Android `config.googleMaps.apiKey`, iOS equivalent. Keys from env.
- Document the env vars (`GOOGLE_MAPS_API_KEY_ANDROID`, `GOOGLE_MAPS_API_KEY_IOS`) — placeholders only.

### Step 2: `useCurrentLocation` hook
- Wrap `expo-location`: check/request foreground permission, get last-known/current position,
  expose `{ region, status, loading, request(), recenter() }`. Fallback region = HCMC center.
- Non-blocking: resolves to fallback when denied; surfaces `status` for UI affordance.

### Step 3: `AppMap` component (`src/components/map/AppMap.tsx`)
- Thin wrapper over `MapView` with `provider={PROVIDER_GOOGLE}`, themed container, current-location
  marker, forwarded `ref` for imperative recenter. Follows TSX order + `stylesSheet(theme)`.

### Step 4: Search overlay UI (`src/components/map/SearchBar.tsx` + saved shortcuts)
- "Where to?" pressable card overlaid near top/bottom; saved-place shortcuts row (Home/Work static).
- Tap → navigates toward booking entry (placeholder route or no-op with TODO for T-0035).
- Theme tokens only; i18n strings.

### Step 5: Rewrite HomeScreen
- Compose `AppMap` (full screen) + floating search overlay + "my location" recenter FAB.
- Use `useCurrentLocation`; handle denied state with a small banner/button. SafeArea aware.

### Step 6: i18n + constants
- Add keys: `homeWhereTo`, `homeSavedHome`, `homeSavedWork`, `homeLocationDenied`, `homeEnableLocation`.
- Default region constant + map style (optional light/dark) in `src/constants` or map module.

### Step 7: Verify
- `npx tsc --noEmit`, `bun lint`, grep for hardcoded colors + hardcoded API keys.
- Manual (user, needs dev build): map renders with Google provider, centers on location, recenter
  works, denied-permission path shows fallback + re-request.

---

## Testing Strategy

- **Type-check**: `npx tsc --noEmit` (primary gate).
- **Lint**: `bun lint`.
- **Manual (user, dev build required)**: render map, permission grant/deny, recenter animation,
  search bar tap target, saved shortcuts, fallback region when GPS unavailable.
- **Edge**: permission denied, location services off, slow GPS, theme light/dark, small screens.
- No unit runner configured → log skipped; logic in hook kept minimal.

---

## Estimated Effort

- Planning/Contracting: 45 min
- Implementation: 3–4 hours
- Verify: 45 min (code-side; native build is user-run)
- Total: ~5 hours

---

## Acceptance Criteria

- [ ] react-native-maps installed (pinned) + config plugin for PROVIDER_GOOGLE (iOS + Android)
- [ ] Google Maps keys from env/config, no hardcoded key
- [ ] HomeScreen renders Google map centered on current location (fallback region otherwise)
- [ ] "My location" recenter button works (expo-location)
- [ ] "Where to?" search bar + saved-place shortcuts UI, themed, i18n
- [ ] Graceful permission-denied handling (non-blocking, re-request affordance)
- [ ] tsc + lint clean; no hardcoded colors or secrets
- [ ] Dev-build requirement + env keys documented in handoff & PROJECT_STATE
