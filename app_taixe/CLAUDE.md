# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **Bun** (see `bun.lock`). Scripts shell out to the Expo CLI:

- `bun start` — start Metro/Expo dev server
- `bun ios` / `bun android` / `bun web` — start with a target platform
- `bun lint` / `bun lint:fix` — run `expo lint` (ESLint flat config)

There is no test runner configured. The `reset-project` script in `package.json` references `./scripts/reset-project.js`, which does not exist in the repo.

A Husky `pre-commit` hook runs `lint-staged`, which executes `expo lint --fix` on staged `*.{ts,tsx,js,jsx}`. Don't use `--no-verify`; fix the lint failure instead.

## High-level architecture

This is an **Expo + React Native** app (Expo SDK ~54.0.33, RN 0.81.5, React 19.1.0, TypeScript ~5.9.2) using **expo-router** for file-based routing. The Expo entry point is `expo-router/entry` (set via `package.json#main`). `app.json` identifies the project as `Template` (slug `template`, scheme `template`) — treat it as a starter template.

Experimental Expo flags enabled in `app.json`: `newArchEnabled` (Fabric/TurboModules), `experiments.typedRoutes`, `experiments.reactCompiler`. Android also has `edgeToEdgeEnabled: true` and `predictiveBackGestureEnabled: false`. New Architecture means avoid legacy bridge-only APIs.

### Routing (`app/`)

`app/_layout.tsx` is the root and wires global providers in this order: `QueryClientProvider` → `GestureHandlerRootView` → `ThemeProvider` → `<Stack>`. It also reads the persisted language out of Zustand and calls `configureLocalization` once on mount.

Top-level routes:
- `index.tsx` — splash; checks `AsyncStorage['hasSeenOnboarding']` and redirects to `/OnBoardingScreen` or `/SigninStack/SigninScreen` after a 2 s delay
- `OnBoardingScreen.tsx` — 3-step pager (local `onboardingData` array), sets `hasSeenOnboarding` in AsyncStorage on complete/skip
- `SigninStack/` — nested stack (`_layout.tsx` sets `initialRouteName='SigninScreen'`) for `SigninScreen` and `SignupScreen`; both screens use mock auth only (no real API call yet)
- `(tabs)/` — bottom-tab group (`HomeScreen`, `ExploreScreen`) using a custom `CustomTabBar`; `_layout.tsx` hides all headers
- `DetailToDoScreen.tsx` — local-state todo list (not persisted), uses the shared `useCustomHeader()` for its header

### State (`src/zustand/`)

`src/zustand/index.ts` re-exports both stores:

- `persist.ts` (default export `ZustandPersist`) — persisted to AsyncStorage under key `app-storage`. Holds `ThemeApp`, `Localization`, `accessToken`, `refreshToken`, `user`. Helpers: `save(key, value)`, `setTokens(accessToken, refreshToken)`, `setUser(user)`, `logout()` (clears tokens + user), `reset()` (resets all state). `partialize` controls what gets written to AsyncStorage — add new persisted keys there.
- `session.ts` (default export, re-exported as named `ZustandSession`) — ephemeral session state (e.g. `ModalDebugStatus`) using `devtools` middleware. `save(key, value, mode?)` supports `mode='update'` for shallow-merging objects. Has `hydrated` flag + `changeHydrated()`.

### API layer (`src/api/`)

Single active API layer:

- `axios/client.ts` — `ApiClient` class singleton (`apiClient`) backed by Axios with 60 s timeout. Exposes typed `get/post/put/patch/delete` helpers that unwrap `response.data`.
- `axios/interceptors.ts` — request interceptor injects `Bearer` token from `ZustandPersist.accessToken`; response interceptor calls `logout()` on 401 and maps errors through `handleApiError`.
- `axios/common.ts` — shared types (`ApiResponse<T>`, `PaginatedResponse<T>`) and `ApiError` class + `handleApiError` helper.
- `axios/queryClient.ts` — TanStack Query client (staleTime 5 min, gcTime 10 min, retry 3, mutations retry 1, `refetchOnWindowFocus: false`).
- `axios/config.ts` — `baseUrl.value` (placeholder `https://api.example.com`) and `ENDPOINTS` constants for auth + user.
- `services/authService.ts` — `login`, `register`, `logout`, `refreshToken`.
- `services/userService.ts` — `getProfile`, `updateProfile`.
- `hooks/useAuth.ts` — `useLogin`, `useRegister`, `useLogout` mutation hooks.
- `hooks/useUser.ts` — `useUserProfile` (disabled when no token), `useUpdateProfile` mutation hooks.

`src/api/index.ts` re-exports everything (apiClient, common types, all hooks, all services).

`src/api/axios/axiosClient.ts` is an unused stub — do not add to it.

### Theming (`src/theme/`)

`ThemeProvider` exposes `ITheme` (color, dimensions, fontSize, font, `changeTheme`) via React Context. The active palette is selected from `ZustandPersist.ThemeApp` (`ModeTheme.Dark` → `Default` palette, `ModeTheme.Light` → `Light` palette). Consume with `useAppTheme()`. Build `StyleSheet`s inside `useMemo(() => createStyles(theme), [theme])` so they rebuild on theme change — see `app/index.tsx` for the canonical pattern.

Color structure (`IAppColor`): `primary` (0–900), `neutral` (50–900), `tertiary` (0–900), `red` (50–900), `textColor.{primary, subText, white}`, `bg.{shuttle, white}`, `navigation.*`, `white`, `stroke`.

Dimensions (`src/theme/dimentions/`): all spacing via `dimensions.pN` tokens (pixel-ratio-rounded), `dimensions.getHeightHeader` (60 + top inset), `dimensions.getHeightFooter` (40 + bottom inset), `dimensions.spacingBottom`. Font sizes via `fontSize.pN`. Both built from a single `responsiveSize` scaler (`scale = 1` currently).

Font: `AppFont.HelveticaNeue` — must be bundled in the native project.

### Localization (`src/localization/`)

`i18next` + `react-i18next`, English (`en.ts`) + Vietnamese (`vi.ts`) resources. Use `getString(key, params?, language?)` for non-component code and `useTranslation` in components. The active language is mirrored into `ZustandPersist.Localization`; change it via `changeLanguage(LANGUAGES.X)`.

## Components (`src/components/`)

### Text
- `AppText` (`components/text/AppText`) — wraps RN `Text` with `allowFontScaling={false}` and a default 14px/black style. **Always use this instead of RN `Text`.**

### Button
- `AppButton` (`components/button/AppButton`) — themed `TouchableOpacity` with optional `leftIcon`/`rightIcon`, `text`, `disabled` state. Disabled state grays out background + text.

### Input
- `AppTextInput` (`components/input/TextInput`) — themed `TextInput` with `allowFontScaling={false}`, neutral border, rounded corners.

### Image
- `RenderImage` (`components/image/RenderImage`) — unified image component using `expo-image` for raster and `react-native-svg`'s `LocalSvg` for SVG (`svgMode` prop). Falls back to `ImageSource.img_fallback` on error. Wraps in `Pressable` for optional `onPress`.

### Modal / Bottom Sheet
- `AppBottomSheet` (`components/modal/AppBottomSheet`) — `forwardRef` wrapper around `@gorhom/bottom-sheet` `BottomSheetModal`. Default `snapPoints=['60%']`, themed backdrop + handle, `enablePanDownToClose` on by default.
- `AppPopup` (`components/modal/AppPopup`) — fullscreen bottom sheet (`snapPoints=['100%']`) that dismisses on tap outside. Themed backdrop, no handle.
- `ExampleBottomSheet` (`components/modal/ExampleBottomSheet`) — usage example only, not a production component.

### Navigation
- `CustomTabBar` (`components/navigation/CustomTabBar`) — renders two tabs (Home, Explore) with text labels and an active underline border; reads theme and safe-area insets.
- `CustomHeader` / `useCustomHeader` / `useCustomBottomTabHeader` (`components/navigation/CustomHeader`) — custom header components. `useCustomHeader()` returns `ExtendedStackNavigationOptions` for use in `Stack.Screen` `options`. `useCustomBottomTabHeader()` returns `BottomTabNavigationOptions`. Both render a centered title with a `BackButton` on the left.
- `BackButton` (`components/navigation/BackButton`) — left-arrow back navigation button.

### Debug / Utilities
- `FPSCounter` (`components/FPSCounter`) — overlaid FPS counter using `requestAnimationFrame`; for debug use.

### Tooltip
- `AppTooltip` (`components/tooltip/index`) — two rendering strategies selectable by `type` prop: `'modal'` (default, portal-based) or `'measure'` (inline layout). Supports `side` (top/bottom/left/right) and `contentSide` (left/center/right).

## Assets (`src/assets/`)

Exported from `src/assets/index.ts`:
- `AnimationSource.relaxing_cat_lottie` — Lottie JSON for use with `lottie-react-native`.
- `ImageSource.ic_google` / `ImageSource.ic_arrowLeft` — SVG icons (use with `RenderImage svgMode`).
- `ImageSource.ReactLogo`, `ImageSource.PartialReactLogo`, `ImageSource.img_fallback` — PNG images.

## Utils (`src/utils/`)

- `Closure` (`utils/Closure`) — class with `debounce`, `handleTap` (single/double tap detection), `delay`, and `cleanup`. Instantiate per component or use as a module-level singleton.
- `withAnchorPoint` (`utils/anchor-point`) — Reanimated `'worklet'` function that adjusts a transform array to rotate/scale around a custom anchor point instead of the center.
- `isObject` (`utils/functions/isObject`) — type-guard helper used by `ZustandSession.save`.

## Notable packages

| Package | Version | Usage |
|---|---|---|
| `expo-router` | ~6.0.23 | File-based routing |
| `@tanstack/react-query` | ^5.90.17 | Server state / data fetching |
| `axios` | ^1.13.2 | HTTP client |
| `zustand` | ^5.0.8 | Client state |
| `@gorhom/bottom-sheet` | ^5.2.8 | Bottom sheets + popups |
| `@legendapp/list` | ^2.0.14 | High-performance list (installed, not yet used in screens) |
| `expo-image` | ~3.0.10 | Optimised image rendering |
| `expo-secure-store` | ^15.0.8 | Installed, not yet wired to token storage |
| `lottie-react-native` | ^7.3.4 | Lottie animations |
| `react-native-svg` | 15.12.1 | SVG rendering |
| `react-native-worklets` | 0.8.1 | Reanimated worklets runtime |
| `i18next` + `react-i18next` | ^25 / ^16 | Localization |

## Conventions

- **Absolute imports only.** Never use `../` or `../../` across modules. TS `paths` define: `components/*`, `assets/*`, `constants/*`, `utils/*`, `theme/*`, `zustand/*`, `localization/*`, `api/*`. Example: `import { useAppTheme } from 'theme/index'`.
- **Code comments must be in English**, regardless of the conversation language.
- **`console.log` is an ESLint error** (`eslint.config.js`). Allowed: `error`, `warn`, `info`, `debug`, `table`, `trace`.
- Use `AppText` instead of RN `Text`; use `AppTextInput` instead of RN `TextInput`.
- `.github/prompts.md` is stale (mentions Three.js + yarn); ignore those parts. The absolute-imports and English-comments rules still apply.

## Notes on the repo state

- No iOS/Android native folders are committed (`/ios`, `/android` are gitignored — managed Expo workflow).
- `expo-env.d.ts` is checked in even though `.gitignore` lists it; leave it alone unless asked.
- Several `.DS_Store` files are tracked. Don't add more.
- `metro.config.js` is the standard Expo default — no custom SVG transformer configured despite `react-native-svg-transformer` being in devDependencies.
- `src/api/axios/axiosClient.ts` is a dead stub; the real client is `src/api/axios/client.ts`.
- Auth screens (`SigninScreen`, `SignupScreen`) use **mock auth only** — no real API calls yet.

## Outer Harness (`.harness/`)

This repo uses an Outer Harness for AI-assisted work — process and audit artifacts that wrap the model. **Read `.harness/AGENTS.md` first** at the start of every session; it tells you what context to load, how to log runs, and what boundaries to respect.

Key entrypoints:
- `.harness/AGENTS.md` — agent operating instructions (load this first)
- `.harness/knowledge/project.md` — bridges org rules → this CLAUDE.md
- `.harness/init.sh <task-id> "<title>"` — bootstrap a new tracked task
- `.harness/gates/run-gates.sh` — pre-merge lint + typecheck + test
- `.harness/logs/runs.jsonl` — append-only audit trail (auto-populated by the `Stop` hook wired in `.claude/settings.json`)

Do not edit anything inside `.harness/` (other than appending to `runs.jsonl`, `tasks/INDEX.md`, or creating new task dirs) without recording the change in `.harness/governance/CHANGELOG.md`.
