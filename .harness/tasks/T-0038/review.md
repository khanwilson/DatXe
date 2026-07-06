# Review

**Task ID**: T-0038
**Phase**: Reviewing
**Date**: 2026-07-06
**Model**: Sonnet

---

## Contract Compliance

- [x] `ProfileScreen.tsx` created in `app/(tabs)/` — correct route location.
- [x] `CustomTabBar.tsx` updated — route-name lookup, 3-tab support.
- [x] `userService.ts` — `__DEV__` mock added for getProfile/updateProfile.
- [x] `iLocalization.ts`, `en.ts`, `vi.ts` — all new keys added consistently.
- [x] `app/(tabs)/_layout.tsx` — explicit tab order (conditionally allowed, used correctly).
- [x] No files touched outside Allowed Files list.
- [x] No backend / Prisma / app_taixe changes.
- [x] No new third-party dependencies.

## Quality Review

- [x] TSX structure order: imports → component → stylesSheet factory → export. ✓
- [x] `useMemo(() => stylesSheet(theme), [theme])` pattern. ✓
- [x] Absolute imports only (no `../`). ✓
- [x] `AppText`, `AppButton`, `AppTextInput`, `RenderImage` used throughout. ✓
- [x] Theme tokens only — no hardcoded hex values. ✓
- [x] English comments only. ✓
- [x] No `console.log`. ✓
- [x] Duplicate import fixed (changeLanguage + getString merged into one import). ✓
- [x] Logout uses `onSettled` (fires on both success and error) → local state always cleared. ✓
- [x] `useLogout` error path already clears local state in hook itself. Defensive. ✓
- [x] `handleToggleLanguage` calls both `changeLanguage` (persists) and `i18n.changeLanguage` (re-renders). ✓

## Regression Risk

- **Home + Explore tabs**: `CustomTabBar` refactored from index-coupled to route-name lookup. The `tabs` array is removed; labels now come from `TAB_LABEL_KEYS` keyed by route name. All three tabs (HomeScreen, ExploreScreen, ProfileScreen) are mapped. Active-highlight logic unchanged (uses `state.index`). Risk: low.
- **Tab order**: `_layout.tsx` explicitly declares `Tabs.Screen` order (Home, Explore, Profile). Matches `state.routes` order used in CustomTabBar. Risk: low.
- **userService DEV mock**: only gates on `__DEV__`. Production path (`apiClient.get/put`) unchanged. Risk: none.
- **i18n keys**: added to interface + both resource files. No existing keys touched. Risk: none.
- **Splash routing**: unchanged. Risk: none.

## Edge Cases

- [x] `user` is null/undefined (logged-out dev state): `displayName` falls back to empty string; `RenderImage` falls back to `img_fallback`. Screen renders without crash.
- [x] `user.name` is empty: `displayName` shows phone number.
- [x] No avatar: `source={undefined}` on `RenderImage` → hits fallback branch. ✓
- [x] Logout while offline: `useLogout.onError` in hook still calls `logout()` + clears query cache; `onSettled` in screen still navigates. ✓
- [x] Update profile error: error message shown via `profileUpdateError` i18n key; edit mode stays open. ✓
- [x] Language toggle: `changeLanguage` persists to `ZustandPersist.Localization`; `i18n.changeLanguage` re-renders i18next consumers. Both called. ✓

## Issues Found

None blocking. One observation (non-blocking, no fix needed):
- `useTranslation` is imported for `i18n.changeLanguage` access. This is the correct approach — `changeLanguage` from localization/index is an async wrapper that also handles un-initialized i18n; calling `i18n.changeLanguage` additionally ensures immediate re-render of `useTranslation` consumers. Slightly redundant but safe and correct given the existing localization architecture.

## Review Decision

**PASS** — no issues found that require fixing. All acceptance criteria met. Ready for Closing.

## Architect Escalation

Not needed. No architecture boundary crossed.
