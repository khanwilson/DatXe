# T-0056: Cleanup — Remove Google Maps Dependencies & Env Vars

**Status**: Planned  
**Priority**: P2  
**Projects**: all (app_user, app_taixe, nestjs_prisma)  
**Depends On**: T-0052, T-0053, T-0054

---

## Description

Clean up old Google Maps dependencies, files, and environment variables that are no longer needed now that we're fully migrated to Mapbox + Goong.

---

## Scope

### In Scope
- Remove `react-native-maps` package from both apps
- Delete old map constants/files that used Region type
- Remove Google Maps API key env vars from all projects
- Remove Google Maps config files
- Remove unused Google Maps service files
- Verify no imports of `react-native-maps` anywhere
- Verify no references to `GOOGLE_MAPS_*` env vars

### Out of Scope
- Functional changes (migration already done)
- New feature development

---

## Acceptance Criteria

- [ ] `react-native-maps` removed from `package.json` in both apps
- [ ] No more `PROVIDER_GOOGLE` references
- [ ] No more `Region` type imports from `react-native-maps`
- [ ] Old Google Maps config files deleted
- [ ] Google Maps service files deleted
- [ ] Google Maps API keys removed from `.env` files
- [ ] `.env.example` no longer mentions GOOGLE_MAPS keys
- [ ] No lint errors from missing packages
- [ ] TypeScript compiles
- [ ] Builds succeed (both apps + backend)

---

## Files To Remove/Delete

### App User
- Delete: `app.config.ts` Google Maps key injection
- Remove: `GOOGLE_MAPS_ANDROID_API_KEY`, `GOOGLE_MAPS_IOS_API_KEY` from `.env*`
- Verify: No imports of `react-native-maps` in any files

### App Taixe
- Remove: `GOOGLE_MAPS_ANDROID_API_KEY`, `GOOGLE_MAPS_IOS_API_KEY` from `.env*`
- Verify: No imports of `react-native-maps` in any files

### Backend
- Delete: `api/config/google-maps.config.ts`
- Delete: `api/modules/routes/services/google-maps.service.ts`
- Verify: No imports of these files in routes module

### Both Apps Shared
- Update: `CLAUDE.md` to reflect new map stack
- Update: `PROJECT_STATE.md` environment section
