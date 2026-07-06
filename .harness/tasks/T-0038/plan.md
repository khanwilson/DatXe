# Plan

**Task ID**: T-0038
**Title**: Profile & settings screen app_user
**Phase**: Planning
**Created**: 2026-07-06
**Model**: Planning with Sonnet (single module, clear scope — no Opus/Architect escalation)

---

## Analysis

### Scope Clarification

- **Affected Project**: `app_user` only (frontend). No backend, no Prisma, no app_taixe.
- **Goal**: A Profile & Settings screen where the logged-in customer can view their
  profile (name / phone / email / avatar), edit their display name, switch theme
  (Dark/Light), switch language (vi/en), and log out.
- **Estimated Complexity**: Medium (new screen + edit flow + nav entry + i18n keys).

### Current State (from context read)

- User data persists in `ZustandPersist` (`user: { id, phone, name?, email? }`,
  plus `avatar?` in the `User`/`updateProfile` service type).
- Hooks already exist: `useUserProfile`, `useUpdateProfile` (PUT `/user/profile`),
  `useLogout` (clears tokens + query cache).
- Theme switch: `theme.changeTheme(ModeTheme.Light | ModeTheme.Dark)` (persisted).
- Language switch: `changeLanguage(LANGUAGES.VIETNAMESE | LANGUAGES.ENGLISH)`.
- `(tabs)` group currently has 2 tabs (`HomeScreen`, `ExploreScreen`); `CustomTabBar`
  **hardcodes** a 2-item `tabs` array (Home, Explore) with matching order.
- No profile/settings screen or nav entry exists anywhere yet.

### Dependencies

- **Previous Tasks**: T-0033 (auth / user shape + `useLogout`), T-0046 (semantic theme).
- **External Dependencies**: none new. Reuses `AppText`, `AppButton`, `AppTextInput`,
  `AppBottomSheet`/`AppPopup`, `RenderImage`, existing hooks & i18n.
- **Blocked By**: nothing (T-0033 is Done).

### Risks

- **Risk 1**: Adding a Profile tab means editing the shared `CustomTabBar` (its tab
  list is hardcoded and index-coupled to route order). → Mitigation: keep the tabs
  array in sync with the `(tabs)` route order; verify active-tab highlighting for all
  three tabs. This is the recommended approach (see Step 1 Option A).
- **Risk 2**: `updateProfile` hits a backend that isn't live yet (`baseUrl` placeholder).
  → Mitigation: follow the T-0033 pattern — gate a `__DEV__` mock in the service so the
  edit flow can be demoed end-to-end without the backend; real API path unchanged for prod.
- **Risk 3**: Profile screen assumes a logged-in user, but the splash currently routes
  straight to `HomeScreen` (auth bypassed in dev). → Mitigation: read `user` from
  `ZustandPersist` defensively; show sensible fallbacks (e.g. name = phone) and route to
  signin on logout. No change to the existing splash/auth routing.

---

## Implementation Approach

### Step 1: Navigation entry — add a Profile tab (Recommended: Option A)

**Option A (recommended)**: Add `ProfileScreen` as a third tab in `app/(tabs)/`.
- New route `app/(tabs)/ProfileScreen.tsx`.
- Update `CustomTabBar`'s hardcoded `tabs` array to include Profile (label + order
  matching the route order the tab navigator emits).
- Rationale: "Profile & settings screen" is a primary destination; a tab is the natural
  home for it and matches how ride-hailing apps expose profile/settings.

**Option B (fallback, lower blast radius)**: Standalone stack screen
`app/ProfileScreen.tsx` reachable from a header/avatar button on Home — leaves
`CustomTabBar` untouched. Documented as fallback if touching the shared tab bar is
undesirable.

Plan proceeds with **Option A**.

### Step 2: ProfileScreen UI (view mode)

- Header (reuse tab header / safe-area top) with title "Profile".
- Profile card: avatar (via `RenderImage`, fallback image), display name (fallback to
  phone if name empty), phone, email (if present).
- "Edit profile" affordance opening edit mode (Step 3).
- Settings section rows:
  - **Theme**: toggle/segmented Dark ↔ Light → `theme.changeTheme(...)`.
  - **Language**: toggle Tiếng Việt ↔ English → `changeLanguage(...)`.
- **Log out** button (destructive style) → `useLogout()` then
  `router.replace('/SigninStack/SigninScreen')`.
- Follows project TSX structure: imports → types → component → `stylesSheet(theme)`
  factory consumed via `useMemo` → export.

### Step 3: Edit name flow

- Edit affordance reveals an `AppTextInput` (inline section or `AppBottomSheet`) bound to
  a local `name` state seeded from `ZustandPersist.user.name`.
- Save → `useUpdateProfile().mutate({ name })`; on success the hook already updates
  `ZustandPersist.user` and invalidates the profile query. Show pending/disabled state on
  the save button while mutating.
- Add a `__DEV__` mock to `userService.getProfile`/`updateProfile` (mirroring the
  `authService` T-0033 pattern) so the flow works before backend is live. Real API path
  for prod stays unchanged.

### Step 4: i18n

- Add profile/settings keys to `iLocalization.ts`, `en.ts`, `vi.ts` (title, edit, save,
  cancel, name label, theme label + Dark/Light, language label, logout, logout confirm).
- Use `useTranslation` in the screen.

### Step 5: Wire-up & cleanup

- Ensure `(tabs)/_layout.tsx` picks up the new route (file-based; no explicit `Tabs.Screen`
  needed unless ordering requires it — verify order matches `CustomTabBar`).
- No changes outside `app_user`.

---

## Testing Strategy

- **Unit tests**: none configured in `app_user` (no test runner — will log as skipped per harness rule).
- **Type check**: `bunx tsc --noEmit` (or project typecheck) must pass.
- **Lint**: `bun lint` (expo lint) must pass — no `console.log`, absolute imports, English comments.
- **Manual testing** (documented; requires dev build — cannot run headless here):
  - Profile renders user name/phone/email/avatar with fallbacks.
  - Edit name → save → value reflected in card + persisted across app restart.
  - Theme toggle repaints screen immediately; persists after restart.
  - Language toggle switches all visible strings; persists after restart.
  - Logout clears tokens and navigates to signin.
- **Edge cases**: empty name (fallback to phone), no avatar (fallback image),
  logout while offline (local state still cleared per `useLogout` onError).

---

## Estimated Effort

- Planning: 30 min
- Implementation: ~2.5 hours
- Testing/verification: ~30 min
- Total: ~3.5 hours

---

## Acceptance Criteria

- [ ] Profile & Settings screen reachable in-app (Profile tab).
- [ ] Displays user name (fallback phone), phone, email, avatar (fallback image).
- [ ] Edit display name → persists to `ZustandPersist` via `useUpdateProfile`.
- [ ] Theme switch (Dark/Light) works and persists.
- [ ] Language switch (vi/en) works and persists.
- [ ] Logout clears session and routes to signin.
- [ ] All new strings localized (en + vi) via i18n.
- [ ] Follows app_user conventions (absolute imports, `stylesSheet`+`useMemo`, `AppText`/`AppButton`/`AppTextInput`, English comments, no `console.log`).
- [ ] `bun lint` + typecheck pass. No changes outside `app_user`.
- [ ] No breaking changes to existing screens/nav (Home, Explore still work).

---

## Model / Escalation Note

Single-module UI task with clear scope and existing patterns → Planning on **Sonnet**,
Implementation on **Opus** (per harness routing). No architecture boundary; **Architect not
required**. Only escalate if the tab-bar change or dev-mock approach surfaces a hidden
cross-cutting issue during implementation.
