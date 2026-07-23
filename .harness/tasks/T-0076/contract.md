# Contract: T-0076

## Source Inputs
- Plan: .harness/tasks/T-0076/plan.md
- Task description: .harness/tasks/T-0076/description.md
- Project state: .harness/PROJECT_STATE.md (Mapbox + Goong stack)

## Scope

Add in-app navigation mode to driver screens (PickupNavigationScreen and ActiveTripScreen):
- Camera follow mode with bearing rotation and 3D pitch
- Maneuver banner showing next turn/distance/street name
- Bottom bar with ETA, distance remaining, re-center/overview controls
- Toggle button to enter/exit navigation mode
- Use Goong Directions API steps[] data for maneuver guidance

## Out of Scope

- Deep-link to external maps app (original description.md approach)
- Voice guidance
- Auto-reroute when driver goes off-route
- Traffic data integration
- Lane guidance
- Speed limit display
- Real-time traffic coloring
- Any changes to app_user or nestjs_prisma

## Allowed Files

**Create:**
- app_taixe/src/components/navigation/NavigationBanner.tsx
- app_taixe/src/components/navigation/NavigationBottomBar.tsx

**Edit:**
- app_taixe/src/components/map/AppMap.tsx
- app_taixe/app/PickupNavigationScreen.tsx
- app_taixe/app/ActiveTripScreen.tsx

## Protected Files / Projects

- app_user/** (no changes allowed)
- nestjs_prisma/** (no changes allowed)
- Any Goong/Mapbox configuration files
- Any API endpoints or backend code
- Any database schema or migrations

## Acceptance Criteria

- [ ] NavigationBanner renders maneuver icon, distance, and street name from Goong steps[]
- [ ] NavigationBottomBar renders ETA, distance, re-center button, overview button
- [ ] AppMap accepts navigationMode prop and switches camera configuration accordingly
- [ ] When navigationMode=true: camera follows user with followPitch=45, followZoomLevel=17, animationMode='easeTo'
- [ ] When navigationMode=false: camera uses bounds-fit mode (current behavior)
- [ ] PickupNavigationScreen has toggle button (top-right FAB) to enter/exit nav mode
- [ ] PickupNavigationScreen renders NavigationBanner and NavigationBottomBar when nav mode ON
- [ ] PickupNavigationScreen destination = pickup point coordinates
- [ ] ActiveTripScreen has toggle button to enter/exit nav mode
- [ ] ActiveTripScreen renders NavigationBanner and NavigationBottomBar when nav mode ON
- [ ] ActiveTripScreen destination = trip destination coordinates
- [ ] ActiveTripScreen only shows toggle during ARRIVED and IN_PROGRESS states
- [ ] No new dependencies added (use existing Mapbox SDK + Goong API)
- [ ] No TypeScript errors
- [ ] No lint errors

## Required Checks

- [ ] lint (npm run lint in app_taixe)
- [ ] typecheck (npm run typecheck in app_taixe)
- [ ] build (npm run build in app_taixe)
- [ ] manual verification: test nav mode toggle on both screens
- [ ] manual verification: verify camera follow mode works on real device (GPS updates)

## API Contract

No backend API changes. All data from existing Goong Directions API responses.

## Database / Migration Impact

None. No database changes.

## Security / Secrets / Auth Impact

None. No new secrets, tokens, or auth changes.

## Native / Release Impact

- Uses existing Mapbox SDK camera props (no new native modules)
- No changes to app.config.ts or native permissions
- No impact on iOS/Android build configuration

## Implementation Constraints

1. **No new dependencies** — use only existing Mapbox SDK (@rnmapbox/maps) and Goong API
2. **Camera props** — use Mapbox camera configuration: followUserLocation, followPitch, followZoomLevel, animationMode
3. **Goong data** — parse steps[] from existing Directions API response (already fetched in screens)
4. **Maneuver icons** — use existing icon set or simple text symbols (no new icon library)
5. **Performance** — avoid re-rendering entire map on every GPS update; use React.memo where appropriate
6. **GPS accuracy** — camera follow may feel jarring on emulator; test on real device
7. **Step advancement** — implement distance threshold logic to advance to next maneuver step as driver progresses

## Fix Loop Rules

- If lint/typecheck/build fails: fix immediately, max 3 attempts
- If acceptance criteria not met: iterate until met
- If blocked by missing Goong data structure: escalate to architect
- If camera follow mode causes crashes: disable feature and escalate

## Escalation Triggers

- Goong Directions API response structure differs from expected steps[] format
- Mapbox camera props don't support required follow mode configuration
- GPS update frequency too low for smooth camera follow (requires native module changes)
- Maneuver icon requirements exceed existing icon set (needs new dependency)
- Performance issues with camera follow mode on real devices

## User Approvals

None required. Plan already approved by user.

## Status

READY_FOR_IMPLEMENTING
