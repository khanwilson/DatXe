# T-0052 — Files Changed

## app_user

| Action | File | Notes |
|--------|------|-------|
| M (rewrite) | `src/components/map/AppMap.tsx` | Mapbox MapView + Camera + LocationPuck; new AppMapHandle.moveCamera |
| M (rewrite) | `src/components/map/useCurrentLocation.ts` | Returns MapCamera; no react-native-maps |
| M | `app/(tabs)/HomeScreen.tsx` | Uses moveCamera + FOCUSED_ZOOM; drops region/animateToRegion/FOCUSED_DELTA |
| DEAD (not deleted) | `src/constants/map.ts` | No importers; rm pending user approval |

**Total**: 3 files modified, 1 file pending delete  
**Projects affected**: app_user only  
**Backend / Prisma**: none  
**Package.json / lockfile**: unchanged
