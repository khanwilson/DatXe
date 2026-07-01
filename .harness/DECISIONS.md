# Decisions Log

**Last Updated**: 2026-07-01 (T-0051)  
**Format**: Per-decision tracking with status and impact

---

## Active Decisions

### D-0001: Task-Based Harness Framework

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | Harness Setup (2026-06-22) |
| **Context** | Need structured task management for multi-project coordination |
| **Decision** | Implement task-based workflow with phases: Created → Planning → Contracting → Generating → Evaluating → Fixing → Closing → Done |
| **Impacted Projects** | All (harness) |
| **Consequences** | <ul><li>All tasks must follow structured workflow</li><li>No code before plan & contract</li><li>API contracts must be documented</li><li>Prisma schema changes must be tracked</li></ul> |

---

## Pending Decisions

### P-D-0001: Authentication Strategy

### D-0008: Mobile Map SDK — @rnmapbox/maps (replaces react-native-maps + PROVIDER_GOOGLE)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Source Task** | T-0051 (2026-07-01) |
| **Context** | Sau khi backend chuyển routing/places sang Goong (D-0007), map tiles phía mobile cũng chuyển sang Mapbox để đồng bộ map stack (Mapbox tiles + Goong routing/places). Thay `react-native-maps`+`PROVIDER_GOOGLE` (D-0006) bằng `@rnmapbox/maps`. T-0051 chỉ setup SDK; migrate `AppMap` là T-0052. |
| **Decision** | Mobile dùng **`@rnmapbox/maps@10.3.1`** (Mapbox GL Native). Two-token model: **`MAPBOX_DOWNLOAD_TOKEN`** (`sk.`, build-time, inject vào config plugin `RNMapboxMapsDownloadToken` qua `app.config.ts`, **KHÔNG** `EXPO_PUBLIC_`) + **`EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`** (`pk.`, runtime, gọi `Mapbox.setAccessToken()` ở app entry). Camera model (`centerCoordinate: [lng, lat]`, `zoomLevel`) thay `Region` (lat/lng + delta). |
| **Impacted Projects** | app_user (T-0051 setup, T-0052 migrate AppMap, T-0053/T-0054 search/route); app_taixe (T-0055 tái dùng pattern); T-0056 (gỡ react-native-maps) |
| **Consequences** | <ul><li>Supersede D-0006 (mobile tile provider): react-native-maps + PROVIDER_GOOGLE → Mapbox. `react-native-maps` **còn cài song song** cho tới T-0056</li><li>Coordinate order đảo sang GeoJSON `[lng, lat]` — đồng nhất với Goong (xem [[map-stack-mapbox-goong]])</li><li>`app.config.ts` giờ inject cả Google Maps key (cũ) lẫn Mapbox download token — Google key gỡ ở T-0056</li><li>`@rnmapbox/maps@10.3.1` tương thích Expo 54 / RN 0.81 / New Arch (peer `react-native >=0.79`, `expo >=47`)</li><li>Vẫn cần dev build / `expo prebuild` (đã có từ D-0006)</li><li>`src/constants/map.ts` (Region-based) giữ nguyên tới T-0052; types Mapbox mới nằm ở `src/constants/mapbox.ts`</li></ul> |

---

### P-D-0001: Authentication Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | First auth-related task |
| **Options** | <ul><li>JWT with refresh tokens</li><li>Session-based with cookies</li><li>OAuth 2.0 integration</li><li>Firebase Auth</li></ul> |
| **Impact Scope** | NestJS backend, both mobile apps, database schema |
| **Notes** | Affects security, mobile offline support, multi-device login |

### P-D-0002: Database Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | First database-related task |
| **Options** | <ul><li>PostgreSQL</li><li>MySQL</li><li>MongoDB</li><li>Cloud-hosted (Firebase, PlanetScale)</li></ul> |
| **Impact Scope** | Prisma config, backend deployment, data migration approach |
| **Notes** | Affects schema design, performance, backup strategy |

### P-D-0003: API Versioning

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | When API becomes stable or needs breaking changes |
| **Options** | <ul><li>URL versioning (`/api/v1/...`)</li><li>Header versioning</li><li>No versioning (internal API only)</li></ul> |
| **Impact Scope** | Backend routing, frontend API clients |
| **Notes** | Affects long-term API evolution and mobile app updates |

### P-D-0004: State Management (Mobile Apps)

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | First feature requiring complex state |
| **Options** | <ul><li>Redux/Redux Toolkit</li><li>Zustand</li><li>MobX</li><li>React Context</li><li>Jotai</li></ul> |
| **Impact Scope** | app_taixe, app_user architecture |
| **Notes** | Affects code structure, testing strategy, developer experience |

### P-D-0005: Testing Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | When test coverage requirements become clear |
| **Options** | <ul><li>Unit + integration (Jest)</li><li>E2E testing (Cypress, Detox)</li><li>API contract testing</li><li>Visual regression testing</li></ul> |
| **Impact Scope** | All projects |
| **Notes** | Affects CI/CD, release confidence, development velocity |

### P-D-0006: Deployment & Environment Strategy

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | Pre-production setup |
| **Options** | <ul><li>AWS/GCP/Azure</li><li>Heroku</li><li>Docker + Kubernetes</li><li>Vercel/Railway</li><li>Managed services (Firebase, Supabase)</li></ul> |
| **Impact Scope** | Backend deployment, CI/CD pipeline, infrastructure |
| **Notes** | Affects cost, scalability, team DevOps knowledge |

### P-D-0007: Monitoring & Logging

| Field | Value |
|-------|-------|
| **Status** | Pending |
| **Trigger** | When production issues appear |
| **Options** | <ul><li>Sentry for error tracking</li><li>DataDog/New Relic for APM</li><li>ELK Stack for logs</li><li>Cloudwatch/Stackdriver</li></ul> |
| **Impact Scope** | All projects |
| **Notes** | Affects debugging, incident response, performance insights |

---

## Superseded Decisions

*(None yet)*

---

## Decision Making Process

1. **Identify**: Recognize when a decision is needed (triggered by task, risk, or recurring question)
2. **Document**: Add to Pending Decisions with Status = Pending
3. **Discuss**: Evaluate options and consequences (may span multiple tasks)
4. **Decide**: Once decided, move to Active Decisions with Status = Accepted
5. **Communicate**: Update `PROJECT_STATE.md` and affected task handoffs
6. **Implement**: Apply decision in new tasks
7. **Review**: Periodically review if decision still holds (quarterly?)

---

## Linking Decisions to Tasks

When a task involves a decision:

- If decision **already exists** in this file: reference it by ID in task `decisions.md`
- If decision is **new to this task**: create it here with `Source Task` set to current task
- If decision **only affects current task**: keep in `tasks/T-XXXX/decisions.md` (don't promote)
- If decision **affects future tasks**: promote to this file

