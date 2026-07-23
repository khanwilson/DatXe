# Files Changed: T-0076

| File | Action | Description |
|---|---|---|
| `app_taixe/src/components/navigation/NavigationBanner.tsx` | Rewritten (fix round 1) | Now accepts step-level instruction/distance, parses maneuver icon from keywords, strips HTML |
| `app_taixe/src/components/navigation/NavigationBottomBar.tsx` | Created (prior session) | Bottom bar with ETA, distance, re-center/overview buttons |
| `app_taixe/src/components/map/AppMap.tsx` | Edited (prior session) | Added navigationMode prop + camera follow config with pitch/zoom/bearing |
| `app_taixe/app/PickupNavigationScreen.tsx` | Edited (fix round 1) | Extracts steps[] from raw Goong response via `as any`, tracks currentStepIndex proportionally, passes instruction/stepDistance to NavigationBanner |
| `app_taixe/app/ActiveTripScreen.tsx` | Edited (fix round 1) | Same steps[] extraction and proportional step advancement for active trip navigation |
