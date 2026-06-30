# Evaluation

**Task ID**: T-0034
**Phase**: Evaluating
**Date**: 2026-06-29

---

## Acceptance Criteria

- [x] react-native-maps installed + pinned (`1.20.1`); keys wired for PROVIDER_GOOGLE iOS + Android
- [x] Google Maps API keys read from env via `app.config.ts`; **no hardcoded key** (grep-verified, config-verified)
- [x] HomeScreen renders a Google map centered on current location; fallback region (HCMC) otherwise
- [x] "My location" recenter button animates to current position (expo-location + AppMapHandle)
- [x] "Where to?" search bar + saved-place shortcuts UI, themed (Mai Linh), i18n (en + vi)
- [x] Permission-denied path is non-blocking with a re-request banner/button
- [x] `npx tsc --noEmit` 0 errors; `bun lint` clean (task files)
- [x] No hardcoded colors; no hardcoded secrets
- [x] Dev-build requirement + env key names documented (handoff + PROJECT_STATE)
- [x] All changes within Allowed Files (1 documented in-scope deviation: hook location)

---

## Checks

| Check | Result |
|-------|--------|
| Typecheck (`tsc --noEmit`) | ✅ 0 errors |
| Lint (`bun lint`) | ✅ 0 errors (2 pre-existing warnings in clearCache.ts, out of scope) |
| Config merge (`expo config --json`) | ✅ env keys → ios/android config; app.json preserved |
| Theme compliance | ✅ all colors via theme tokens |
| Secrets scan | ✅ no hardcoded API keys |

---

## Notes / Deviations

- `react-native-maps@1.20.1` ships no config plugin; keys read by Expo prebuild from
  `ios.config.googleMapsApiKey` / `android.config.googleMaps.apiKey`. `app.config.ts` sets these
  from env — NOT added to `plugins` (would break prebuild).
- `useCurrentLocation` lives in `src/components/map/` (not `src/hooks/`) to avoid editing
  `tsconfig.json` (out of Allowed Files). In-scope, documented.
- **Cannot verify rendering without a dev build** — map display, recenter animation, and the
  permission flow require a Google Maps API key + `expo prebuild` / EAS dev client (user-run).
  Code-side gates all pass.

**Result**: PASS (code + config). Runtime render pending user dev build with real keys.
