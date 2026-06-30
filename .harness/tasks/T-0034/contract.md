# Contract

**Task ID**: T-0034
**Phase**: Contracting
**Created**: 2026-06-29
**Approved**: [ ] Yes / [ ] No

---

## Scope

### In Scope

- Add **react-native-maps** (pinned, Expo SDK 54 / RN 0.81 / New Arch compatible).
- Expo **config plugin** for `react-native-maps` with `PROVIDER_GOOGLE` on iOS + Android; Google
  Maps API keys injected from **env** (no hardcoded key). Migrate `app.json` → `app.config.ts` only
  if env interpolation requires it; otherwise document EAS-secret approach.
- `src/hooks/useCurrentLocation.ts` — expo-location permission + position + fallback region (HCMC).
- `src/components/map/AppMap.tsx` — reusable `MapView` wrapper (Google provider, current-location
  marker, ref for recenter).
- `src/components/map/SearchBar.tsx` (+ saved-shortcuts) — "Where to?" overlay UI (UI only).
- Rewrite `app/(tabs)/HomeScreen.tsx` — full-screen map + search overlay + "my location" FAB +
  permission-denied handling.
- i18n keys for the new strings; default-region/map constants.

### Out of Scope

- Live place autocomplete / geocode / directions API calls (T-0035 booking).
- Driver/pickup/dropoff markers, route polyline (later tasks).
- Booking creation, fare, payment.
- app_taixe, nestjs_prisma, Prisma.
- Running an EAS/dev build (config + code only; user runs the build).

---

## Allowed Files

```
app_user/package.json                                # + react-native-maps
app_user/bun.lock                                    # lockfile
app_user/app.json                                    # config plugin (or →)
app_user/app.config.ts                               # if env interpolation needed (new)
app_user/.env.example                                # document map key vars (new, placeholders)
app_user/app/(tabs)/HomeScreen.tsx                   # rewrite
app_user/src/components/map/**                        # new: AppMap, SearchBar, shortcuts
app_user/src/hooks/useCurrentLocation.ts             # new
app_user/src/constants/**                             # default region / map constants
app_user/src/localization/**                          # new strings
.harness/tasks/T-0034/**
.harness/TASKS.md
.harness/PROJECT_STATE.md
.harness/DECISIONS.md
```

**Rationale**: One screen + reusable map/search components + location hook + 1 native dependency
with its config. Confined to app_user.

If implementation needs a file outside this list (e.g. root `app/_layout.tsx`, `metro.config.js`),
**stop and ask** first.

---

## Impacted Projects

- [ ] app_taixe
- [x] app_user
- [ ] nestjs_prisma
- [ ] docs
- [x] harness

---

## Acceptance Criteria

- [ ] react-native-maps installed + pinned; config plugin sets PROVIDER_GOOGLE for iOS + Android
- [ ] Google Maps API keys read from env/config; **no hardcoded key** (grep-verified)
- [ ] HomeScreen renders a Google map centered on current location; fallback region (HCMC) otherwise
- [ ] "My location" recenter button animates to current position (expo-location)
- [ ] "Where to?" search bar + saved-place shortcuts present, themed (Mai Linh), i18n
- [ ] Permission-denied path is non-blocking with a re-request affordance
- [ ] `npx tsc --noEmit` 0 errors; `bun lint` clean
- [ ] No hardcoded colors; no hardcoded secrets
- [ ] Dev-build requirement + env key names documented (handoff + PROJECT_STATE)
- [ ] All changes within Allowed Files

---

## Dependency Changes

```
+ react-native-maps (pinned ~X.Y.Z, New-Arch compatible)  — native map rendering (Google provider)
```
Lý do: app gọi xe cần Google Maps thật (Maps/Places/Routes nhất quán). `react-native-maps` +
`PROVIDER_GOOGLE` cho cùng trải nghiệm Google trên cả iOS lẫn Android. **Hệ quả: rời Expo Go,
bắt buộc dev client / prebuild.**

---

## Database Impact

Không.

---

## Test Strategy

- Type check: `npx tsc --noEmit`.
- Lint: `bun lint`.
- Grep: hardcoded colors + hardcoded API keys.
- Manual (user, dev build): map render (Google), center-on-location, recenter, denied → fallback.

---

## Design Decisions (chốt với user 2026-06-29)

1. **Map lib**: `react-native-maps` + `PROVIDER_GOOGLE` trên cả iOS & Android (không dùng expo-maps
   vì Google chỉ Android; Apple Maps không hợp yêu cầu).
2. **Build**: development build (không Expo Go); keys qua Expo config plugin + env/EAS secrets.
3. **Scope**: UI + current location; place-search API để T-0035.
4. **Fallback**: region mặc định HCMC; permission denied → non-blocking.
5. Backend `/routes/*` (Places/Directions/Matrix) sẽ render markers/polyline ở các task booking/trip sau.

---

## Sign-off

- **Planner**: FRIDAYAIX (harness)
- **Approved**: [ ] Yes / [ ] No
- **Approved At**: -
