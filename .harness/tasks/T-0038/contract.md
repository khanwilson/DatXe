# Contract

**Task ID**: T-0038
**Title**: Profile & settings screen app_user
**Phase**: Contracting
**Created**: 2026-07-06
**Model**: Contracting with Sonnet

---

## Scope

Build a Profile & Settings screen in `app_user` for the logged-in customer:

- **View**: avatar (fallback image), display name (fallback to phone), phone, email (if present).
- **Edit**: display name via `useUpdateProfile` (persists to `ZustandPersist.user`).
- **Settings**: theme switch (Dark ↔ Light), language switch (vi ↔ en).
- **Logout**: clears session via `useLogout`, routes to signin.
- **Navigation**: add Profile as a 3rd tab in `app/(tabs)/` (Option A, approved).
- **i18n**: all new strings localized (en + vi).
- **DEV mock**: gate `userService.getProfile`/`updateProfile` behind `__DEV__`
  (mirror T-0033 authService pattern) so edit flow demos without a live backend.

---

## Out of Scope

- Backend / `nestjs_prisma` changes. No new endpoints.
- Prisma schema / migrations.
- `app_taixe` changes.
- Avatar image upload / image picker (view + fallback only; no camera/library flow).
- Email editing (display only; edit is name-only this task).
- Changing splash/auth routing or the dev auth bypass.
- New third-party dependencies.
- New reusable components in `src/components/` unless strictly required by the screen
  (prefer composing existing `AppText`/`AppButton`/`AppTextInput`/`RenderImage`).

---

## Allowed Files

### New
- `app_user/app/(tabs)/ProfileScreen.tsx` — the screen (route).

### Modified
- `app_user/src/components/navigation/CustomTabBar.tsx` — add Profile to hardcoded tabs array (label + order).
- `app_user/src/api/services/userService.ts` — add `__DEV__` mock for getProfile/updateProfile.
- `app_user/src/localization/iLocalization.ts` — add profile/settings key types.
- `app_user/src/localization/resources/en.ts` — add English strings.
- `app_user/src/localization/resources/vi.ts` — add Vietnamese strings.

### Conditionally-allowed (only if tab ordering requires explicit declaration)
- `app_user/app/(tabs)/_layout.tsx` — only if file-based route order needs an explicit
  `Tabs.Screen` order to match `CustomTabBar`. Prefer not to touch.

If any file outside this list must change, STOP and ask.

---

## Acceptance Criteria

- [ ] Profile tab appears in the bottom tab bar and opens `ProfileScreen`.
- [ ] Screen shows name (fallback phone), phone, email (if present), avatar (fallback image).
- [ ] Editing display name saves via `useUpdateProfile` and reflects in the card; persists across restart.
- [ ] Theme toggle (Dark/Light) repaints immediately and persists (`theme.changeTheme`).
- [ ] Language toggle (vi/en) switches visible strings and persists (`changeLanguage`).
- [ ] Logout clears tokens + user (`useLogout`) and routes to `/SigninStack/SigninScreen`.
- [ ] All new copy localized in en + vi; no hardcoded user-facing strings in the screen.
- [ ] Home + Explore tabs still work; active-tab highlight correct for all 3 tabs.
- [ ] DEV mock lets edit flow work without backend; prod path unchanged.

---

## Required Checks

- `bun lint` (expo lint) — must pass. No `console.log`; absolute imports; English comments.
- Typecheck: `bunx tsc --noEmit` — must pass.
- Test: no runner configured → log as skipped.
- Manual (documented, needs dev build — not runnable headless here).

---

## Implementation Constraints

- **Conventions**: `app/` for screens; absolute imports only; TSX order
  imports → types → component → `stylesSheet(theme)` factory → export; styles via
  `useMemo(() => stylesSheet(theme), [theme])`; use `AppText`/`AppButton`/`AppTextInput`/`RenderImage`.
- **Theme tokens only** (no hardcoded hex): use `theme.color.*`, `theme.dimensions.*`, `theme.fontSize.*`.
  Logout/destructive uses `theme.color.state.error`.
- **i18n**: add keys to `iLocalization` interface + both resource files in the same order;
  use `getString`/`useTranslation`.
- **DEV mock** must not alter the production API call signature or endpoints.
- No changes to persisted store shape (`ZustandPersist` already holds user/theme/language).

---

## User Approvals

- **Navigation Option A (Profile tab, edits shared `CustomTabBar`)** — approved by user ("continue" after plan presented Option A).

## Scope Expansions

- None yet.
