# Handoff

**Task ID**: T-0038
**Title**: Profile & settings screen app_user
**Final Status**: Done
**Completed**: 2026-07-06

---

## Summary

Added a Profile & Settings screen to `app_user` as a third tab. The screen lets the logged-in customer view their profile, edit their display name, toggle theme (Dark/Light), switch language (vi/en), and log out. All logic reuses existing hooks and stores — no new dependencies or backend changes.

---

## Files Changed

| File | Change |
|------|--------|
| `app_user/app/(tabs)/ProfileScreen.tsx` | **New** — profile & settings screen (3rd tab route) |
| `app_user/app/(tabs)/_layout.tsx` | **Modified** — explicit `Tabs.Screen` order: Home, Explore, Profile |
| `app_user/src/components/navigation/CustomTabBar.tsx` | **Modified** — route-name lookup (removes index-coupling); adds ProfileScreen label |
| `app_user/src/api/services/userService.ts` | **Modified** — `__DEV__` mock for getProfile/updateProfile; `avatar?` field added to `User` type |
| `app_user/src/localization/iLocalization.ts` | **Modified** — added tab + profile/settings key types |
| `app_user/src/localization/resources/en.ts` | **Modified** — English strings for tabs + profile/settings |
| `app_user/src/localization/resources/vi.ts` | **Modified** — Vietnamese strings for tabs + profile/settings |

---

## Commands Run

```
bunx tsc --noEmit --project app_user/tsconfig.json
# → No errors in T-0038 files (pre-existing TripStatusSheet.tsx error is unrelated)

cd app_user && bun lint
# → 0 errors in T-0038 files (2 pre-existing warnings in BookingRouteScreen + SearchDestinationScreen)
```

## Test Status

- **Typecheck**: PASS (T-0038 files clean)
- **Lint**: PASS (T-0038 files clean)
- **Unit tests**: SKIPPED — no test runner configured in app_user
- **Manual testing**: Requires dev build; not runnable headless

---

## Key Decisions

- **CustomTabBar refactor**: removed hardcoded index-coupled `tabs` array; replaced with `TAB_LABEL_KEYS: Record<string, keyof iLocalization>` keyed by route name. Order-independent. Safer for future tab additions.
- **DEV mock in userService**: mirrors T-0033 authService pattern. `__DEV__` guard; reads from `ZustandPersist` so edits reflect locally without a live backend.
- **`avatar?` field added to `User` type** in userService — the service type needed it even though `ZustandPersist.user` doesn't persist avatar (not in the partialize list). No store shape change.
- **Logout uses `onSettled`** (not `onSuccess`) so navigation to signin fires regardless of network state.
- **Language toggle** calls both `changeLanguage` (persists + initializes i18n if needed) and `i18n.changeLanguage` (immediate re-render of useTranslation consumers).

---

## Known Issues

- `TripStatusSheet.tsx` has a pre-existing typecheck error (`p18` dimension token missing) — unrelated to this task, exists in untracked files from another in-progress task.
- `BookingRouteScreen.tsx` and `SearchDestinationScreen.tsx` have pre-existing lint warnings — unrelated, outside contract.
- Profile screen assumes a logged-in user; if `user` is null (dev bypass state), it renders gracefully with empty fallbacks but doesn't redirect to signin. Production auth gate is a future task (T-0006).

---

## Next Steps

- **T-0035**: Booking confirmation & payment UI — will use the same tab navigation.
- **T-0006**: Auth API — once live, remove `__DEV__` mocks from authService + userService.
- Avatar upload/image picker: explicitly out of scope for this task; needs camera/library permissions (just-in-time per project convention) when implemented.
