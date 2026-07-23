# Evaluation: T-0076

## Summary

Re-evaluation after Fix Round 1. The prior FAIL_FIXABLE cited `NavigationBanner` using route `summary` (total distance/duration) instead of per-step Goong maneuver data, and flagged that decision D1 ("Goong responses don't include `steps[]`") was made unilaterally without verifying the backend DTO, which explicitly declares `steps: RouteStepDto[]` with `instruction`/`distance`/`duration`.

The implementer has now fixed this: `NavigationBanner` was rewritten to accept per-step `instruction` and `stepDistance` props, derives a maneuver icon via keyword matching on the instruction text (left/right/straight/merge/roundabout/u-turn), and strips Goong's HTML-tagged instruction text for display. Both `PickupNavigationScreen` and `ActiveTripScreen` now extract `routes[0].legs[0].steps[]` from the raw `directionsData` response (cast locally, since `RouteGeometry` still doesn't declare `steps` — no out-of-scope file was touched to fix the type), compute a `currentStepIndex` proportional to the driver's progress along the decoded polyline, and pass the step's `instruction`/`distance.text` into the banner, falling back to `summary` totals only when no steps are present.

Lint and typecheck both pass clean. All 15 acceptance criteria are now met. Contract file scope is respected; no new dependencies; no out-of-scope files touched.

## Commands Run
| Command | Result | Notes |
|---|---|---|
| `bun lint` (app_taixe) | PASS | 0 errors, 8 warnings — all pre-existing, in unrelated files (`SearchDestinationScreen.tsx`, `useGoongPlace.ts`, `authService.ts`, `userService.ts`, `clearCache.ts`). None touch T-0076 files. |
| `npx tsc --noEmit` (app_taixe) | PASS | Exit 0, no errors. |
| `npm run build` (app_taixe) | N/A | No `build` script in `app_taixe/package.json` (Expo managed workflow). Logged as skipped, not failed — consistent with prior evaluation. |
| `git status` / `git diff --stat` | Checked | Only the 5 contract-allowed files modified/created (plus untracked `.harness/tasks/T-0076/` and previously-modified `.harness/runtime/agent-status.json`, both harness bookkeeping, not source). |
| Cross-check backend DTO/service (`nestjs_prisma/api/modules/routes/dto/routes.dto.ts`, `.../services/goong.service.ts`, `.../routes.service.ts`) | Checked | Confirms `RouteStepDto { instruction, distance, duration }` is the declared shape and both `GoongService.normalizeDirections` and `RoutesService.transformDirections` pass `routes` through untouched (raw Goong `legs[].steps[]` survives to the frontend). The new frontend extraction shape (`{ instruction, distance: {text,value}, duration: {text,value} }`) matches this DTO exactly. |

## Contract Compliance

- Allowed Files: all 5 respected exactly.
  - Created: `app_taixe/src/components/navigation/NavigationBanner.tsx`, `app_taixe/src/components/navigation/NavigationBottomBar.tsx`
  - Edited: `app_taixe/src/components/map/AppMap.tsx`, `app_taixe/app/PickupNavigationScreen.tsx`, `app_taixe/app/ActiveTripScreen.tsx`
- Out of Scope: `app_user/**` and `nestjs_prisma/**` untouched (only read for verification, not modified) — confirmed via `git status`/`git diff --stat`.
- No new dependencies: `app_taixe/package.json` and `bun.lock` not modified.
- No native/config changes: `app.config.ts` untouched.
- The `steps` typing gap on `RouteGeometry` (in `app_taixe/src/api/services/goongPlaceService.ts`, an out-of-scope file) was correctly worked around with a local `as any` cast inside the allowed screen files rather than editing the out-of-scope service file — matches the fix recommendation from the prior evaluation.

## Acceptance Criteria
| Criterion | Result | Evidence |
|---|---|---|
| NavigationBanner renders maneuver icon, distance, street name from Goong `steps[]` | **PASS** | `NavigationBanner.tsx` props now `instruction`/`stepDistance`/`destinationName`; `getManeuverIcon()` derives a directional glyph from instruction keywords; `stripHtml()` cleans the raw Goong HTML instruction; both screens supply `bannerInstruction`/`bannerStepDistance` sourced from `routeSteps[currentStepIndex]` (extracted from `directionsData.routes[0].legs[0].steps[]`), with summary-only fallback if steps are absent. |
| NavigationBottomBar renders ETA, distance, re-center, overview | PASS | Unchanged from prior pass — `eta`, `distance`, `onRecenter`, `onOverview` wired in both screens. |
| AppMap accepts `navigationMode` prop, switches camera | PASS | Unchanged — `navigationMode` branch on `<MapboxGL.Camera>`. |
| navigationMode=true → followUserLocation, followPitch=45, followZoomLevel=17, animationMode='easeTo' | PASS | Confirmed literal values in current `AppMap.tsx` diff. |
| navigationMode=false → bounds-fit mode preserved | PASS | Original `bounds` branch preserved under `else`, plus a plain center/zoom fallback when no bounds. |
| PickupNavigationScreen toggle FAB top-right | PASS | `styles.navToggle`, positioned `top`/`right`. |
| PickupNavigationScreen renders Banner+BottomBar when nav ON | PASS | Conditional block on `navigationMode`, now passing step-level `instruction`/`stepDistance`. |
| PickupNavigationScreen destination = pickup coords | PASS | `destinationParam` built from `pickupLat`/`pickupLng`. |
| ActiveTripScreen toggle button | PASS | Rendered when `showNavToggle`. |
| ActiveTripScreen renders Banner+BottomBar when nav ON | PASS | Conditional block on `navigationMode`, now passing step-level `instruction`/`stepDistance`. |
| ActiveTripScreen destination = trip destination coords | PASS | `destinationParam` built from `paramDestLat`/`paramDestLng`. |
| ActiveTripScreen toggle only ARRIVED/IN_PROGRESS | PASS | `showNavToggle = status === 'ARRIVED' \|\| status === 'IN_PROGRESS'`. |
| No new dependencies | PASS | `package.json`/`bun.lock` unchanged. |
| No TypeScript errors | PASS | `tsc --noEmit` exit 0. |
| No lint errors | PASS | `bun lint` 0 errors. |

15/15 pass.

## Security / Secrets Check

No secrets, tokens, or API keys introduced or logged in the 5 changed files. No new network calls (reuses existing `useDirections` hook). No auth/permission logic touched. The `as any` casts used to read `steps[]` off the raw directions response are localized to derived read-only display values (strings), not used in any security-sensitive path.

## Failures

None.

## Root Cause

N/A — prior failure (banner using summary instead of per-step Goong maneuver data) is resolved. Cross-checking the backend DTO confirms the fix's assumption is correct: `RouteStepDto` (`instruction`, `distance`, `duration`) is exactly the shape both screens now consume, and the backend forwards it through untouched (`GoongService.normalizeDirections` and `RoutesService.transformDirections` both pass `routes` raw). D1 in `decisions.md` (claiming steps aren't available) is now superseded by this fix but was left in the decisions log as historical record — no action needed since the fix round already supersedes it in practice; note for handoff that D1 should be marked superseded when promoting decisions to `PROJECT_STATE.md`/`DECISIONS.md`.

## Fix Recommendation

None required for this task. Minor note for the handoff step: when promoting decisions, mark D1 in `.harness/tasks/T-0076/decisions.md` as superseded by the Fix Round 1 change (steps data is available and now consumed), so it isn't mistaken for a still-valid architectural constraint by future tasks.

## Re-evaluation History

- **Pass 1**: FAIL_FIXABLE — `NavigationBanner` used `summary` totals instead of per-step Goong `steps[]` maneuver data; D1 was an unverified assumption contradicted by the backend DTO.
- **Pass 2 (this evaluation)**: PASS — `NavigationBanner` rewritten to consume per-step `instruction`/`distance` from `routes[0].legs[0].steps[]`, extracted in both screens with proportional step advancement and summary fallback. All 15 acceptance criteria met, lint/typecheck clean, contract scope respected.

## Decision
PASS
