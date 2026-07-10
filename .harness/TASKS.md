# Task Registry

**Last Updated**: 2026-07-09  
**Total Tasks**: 66  
**Completed**: 24  
**In Progress**: 0  
**Blocked**: 0  
**Cancelled**: 5

---

## Task Index

### Wave 1: Backend Foundation

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0001 | P1 | Done | Done | Backend env config mở rộng | - | [T-0001](tasks/T-0001/) | nestjs_prisma |
| T-0002 | P1 | Done | Done | Prisma schema mở rộng cho booking flow | T-0001 | [T-0002](tasks/T-0002/) | nestjs_prisma |
| T-0003 | P1 | Done | Done | Redis connection và cache service | T-0001 | [T-0003](tasks/T-0003/) | nestjs_prisma |
| T-0004 | P1 | Done | Done | WebSocket gateway cơ bản | T-0001, T-0003 | [T-0004](tasks/T-0004/) | nestjs_prisma |
| T-0005 | P1 | Done | Done | API response format và error handling | - | [T-0005](tasks/T-0005/) | nestjs_prisma |
| T-0031 | P1 | Done | Done | Google Maps routing service backend | T-0003 | [T-0031](tasks/T-0031/) | nestjs_prisma |

### Wave UI: Mobile App Interfaces (Priority - Demo Ready)

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0032 | P0 | Closing | Done | Onboarding & Welcome screens app_user | - | [T-0032](tasks/T-0032/) | app_user |
| T-0032.1 | P1 | Closing | Done | Button Layout & Animation Enhancement | T-0032 | [T-0032.1](tasks/T-0032.1/) | app_user |
| T-0032.2 | P1 | Done | Done | Permissions screen wire real OS permission requests | T-0032 | [T-0032.2](tasks/T-0032.2/) | app_user |
| T-0046 | P1 | Done | Done | Bộ theme Mai Linh (semantic) | T-0032 | [T-0046](tasks/T-0046/) | app_user, app_taixe |
| T-0033 | P0 | Done | Done | Login & Registration screens app_user (Phone+OTP) | - | [T-0033](tasks/T-0033/) | app_user |
| T-0033.1 | P1 | Done | Done | PhoneInput component + libphonenumber-js validation | T-0033 | [T-0033.1](tasks/T-0033.1/) | app_user |
| T-0034 | P0 | Done | Done | Home & map taxi search app_user | T-0031 | [T-0034](tasks/T-0034/) | app_user |
| T-0035 | P0 | Created | Cancelled | Booking confirmation & payment UI app_user | T-0034 | [T-0035](tasks/T-0035/) — superseded by T-0064 | app_user |
| T-0036 | P0 | Done | Done | Active trip tracking with routing app_user | T-0035, T-0050 | [T-0036](tasks/T-0036/) | app_user |
| T-0037 | P0 | Created | Planned | Trip history & bookings list app_user | T-0036 | [T-0037](tasks/T-0037/) | app_user |
| T-0038 | P0 | Done | Done | Profile & settings screen app_user | T-0033 | [T-0038](tasks/T-0038/) | app_user |
| T-0039 | P0 | Created | Planned | Onboarding & Welcome screens app_taixe | - | [T-0039](tasks/T-0039/) | app_taixe |
| T-0040 | P0 | Created | Planned | Login & Registration screens app_taixe | - | [T-0040](tasks/T-0040/) | app_taixe |
| T-0041 | P0 | Created | Cancelled | Driver status dashboard app_taixe | T-0050, T-0055 | [T-0041](tasks/T-0041/) — superseded by T-0069 | app_taixe |
| T-0042 | P0 | Created | Cancelled | Booking offers & acceptance UI app_taixe | T-0041 | [T-0042](tasks/T-0042/) — superseded by T-0070 | app_taixe |
| T-0043 | P0 | Created | Cancelled | Navigation to pickup with routing app_taixe | T-0042, T-0050 | [T-0043](tasks/T-0043/) — superseded by T-0070 | app_taixe |
| T-0044 | P0 | Created | Cancelled | Trip in progress & routing display app_taixe | T-0043 | [T-0044](tasks/T-0044/) — superseded by T-0070 | app_taixe |
| T-0045 | P0 | Created | Planned | Ride history & driver profile app_taixe | T-0044 | [T-0045](tasks/T-0045/) | app_taixe |

### Wave Mapbox: Mapbox & Goong API Integration (Replace Google Maps)

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0050 | P1 | Done | Done | Backend: Goong API service (replace GoogleMapsService) | - | [T-0050](tasks/T-0050/) | nestjs_prisma |
| T-0051 | P1 | Done | Done | Frontend: Install & configure @rnmapbox/maps (app_user) | - | [T-0051](tasks/T-0051/) | app_user |
| T-0052 | P1 | Done | Done | Frontend: Migrate AppMap component to Mapbox (app_user) | T-0051 | [T-0052](tasks/T-0052/) | app_user |
| T-0053 | P1 | Done | Done | Frontend: Goong Places Autocomplete integration (app_user) | T-0050, T-0052 | [T-0053](tasks/T-0053/) | app_user |
| T-0053.1 | P2 | Done | Done | Frontend: Enhance Autocomplete UI/UX for SearchDestinationScreen (app_user) | T-0053 | [T-0053.1](tasks/T-0053.1/) | app_user |
| T-0054 | P1 | Created | Planned | Frontend: Route display with Mapbox directions layer (app_user) | T-0050, T-0052 | [T-0054](tasks/T-0054/) | app_user |
| T-0055 | P2 | Done | Planned | Frontend: Install & configure @rnmapbox/maps (app_taixe) | T-0051 | [T-0055](tasks/T-0055/) | app_taixe |
| T-0056 | P2 | skip | Planned | Cleanup: Remove Google Maps dependencies & env vars | T-0052, T-0053, T-0054 | [T-0056](tasks/T-0056/) | all |

### Wave VNPay: VNPay Sandbox Payment Integration

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0061 | P0 | Planning | In Progress | Wave VNPay Master Plan | - | [T-0061](tasks/T-0061/) | all |
| T-0062 | P0 | Done | Done | BE: Booking + Payment + VNPay Module | - | [T-0062](tasks/T-0062/) | nestjs_prisma |
| T-0063 | P0 | Done | Done | BE: Dispatch Module (find nearest driver) | T-0062 | [T-0063](tasks/T-0063/) | nestjs_prisma |
| T-0064 | P0 | Done | Done | FE app_user: Booking submit + VNPay payment flow | T-0062 | [T-0064](tasks/T-0064/) | app_user |
| T-0065 | P0 | Created | Cancelled | FE app_user: ActiveTripScreen sau payment | T-0064 | [T-0065](tasks/T-0065/) — superseded by T-0071 | app_user |
| T-0075 | P0 | Done | Done | VNPay Sandbox End-to-End Wiring (bỏ mock hardcode) | T-0062, T-0064 | [T-0075](tasks/T-0075/) | nestjs_prisma, app_user |

### Wave Trip Flow: Payment → Driver → Hoàn Thành

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0067 | P0 | Done | Done | Wave Trip Flow Master Plan | - | [T-0067](tasks/T-0067/) | all |
| T-0068 | P0 | Done | Done | BE: Driver Location & Dispatch Enhancement | T-0062, T-0063 | [T-0068](tasks/T-0068/) | nestjs_prisma |
| T-0068.1 | P0 | Done | Done | BE: Trip Cancellation, Retry & Cashback | T-0062, T-0063, T-0068 | [T-0068.1](tasks/T-0068.1/) | nestjs_prisma |
| T-0069 | P0 | Done | Done | FE app_taixe: Foundation (Mapbox + Auth + Dashboard) | T-0055, T-0058 | [T-0069](tasks/T-0069/) | app_taixe |
| T-0070 | P0 | Done | Done | FE app_taixe: Trip Flow (Offer → Pickup → Dropoff → Complete) | T-0068, T-0069 | [T-0070](tasks/T-0070/) | app_taixe |
| T-0071 | P0 | Done | Done | FE app_user: Trip Flow (Looking → Pickup → Dropoff → Complete) | T-0064, T-0068 | [T-0071](tasks/T-0071/) | app_user |
| T-0072 | P0 | Done | Done | Integration & Realtime Wiring | T-0068, T-0070, T-0071 | [T-0072](tasks/T-0072/) | all |
| T-0073 | P0 | Done | Done | BE: Driver Online/Offline & Stats API | T-0068 | [T-0073](tasks/T-0073/) | nestjs_prisma |
| T-0074 | P0 | Done | Done | Hoàn thiện flow đăng nhập Phone + OTP (app_user + app_taixe) | T-0003 | [T-0074](tasks/T-0074/) | nestjs_prisma, app_user, app_taixe |

### Wave 2: Core Backend APIs

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0006 | P1 | Created | Planned | Auth API cải tiến refresh token | T-0002, T-0005 | [T-0006](tasks/T-0006/) | nestjs_prisma |
| T-0007 | P1 | Created | Planned | User và Driver profile APIs | T-0002, T-0006 | [T-0007](tasks/T-0007/) | nestjs_prisma |
| T-0008 | P1 | Created | Planned | Booking create status cancel APIs | T-0002, T-0006 | [T-0008](tasks/T-0008/) | nestjs_prisma |
| T-0009 | P1 | Created | Planned | Dispatch service cơ bản | T-0002, T-0004, T-0008 | [T-0009](tasks/T-0009/) | nestjs_prisma |
| T-0010 | P1 | Created | Planned | Trip lifecycle APIs | T-0002, T-0004, T-0008, T-0009 | [T-0010](tasks/T-0010/) | nestjs_prisma |
| T-0011 | P1 | Created | Planned | Payment APIs cơ bản | T-0002, T-0006, T-0010 | [T-0011](tasks/T-0011/) | nestjs_prisma |

### Wave 3: Mobile Foundation

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0012 | P1 | Created | Planned | Mobile env config app_user | - | [T-0012](tasks/T-0012/) | app_user |
| T-0013 | P1 | Created | Planned | Mobile env config app_taixe | - | [T-0013](tasks/T-0013/) | app_taixe |
| T-0014 | P1 | Created | Planned | Mobile API client app_user | T-0012, T-0006 | [T-0014](tasks/T-0014/) | app_user |
| T-0015 | P1 | Created | Planned | Mobile API client app_taixe | T-0013, T-0006 | [T-0015](tasks/T-0015/) | app_taixe |

### Wave 4: Mobile Auth Flow

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0016 | P1 | Created | Planned | Login Register UI app_user | T-0014 | [T-0016](tasks/T-0016/) | app_user |
| T-0017 | P1 | Created | Planned | Login Register UI app_taixe | T-0015 | [T-0017](tasks/T-0017/) | app_taixe |

### Wave 5: Mobile Booking Flow app_user

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0018 | P1 | Created | Planned | Map và location picker app_user | T-0014, T-0031 | [T-0018](tasks/T-0018/) | app_user |
| T-0019 | P1 | Created | Planned | Booking create screen app_user | T-0014, T-0008, T-0018 | [T-0019](tasks/T-0019/) | app_user |
| T-0020 | P1 | Created | Planned | Booking status tracking app_user | T-0019, T-0004 | [T-0020](tasks/T-0020/) | app_user |
| T-0021 | P1 | Created | Planned | Trip tracking và payment app_user | T-0020, T-0010, T-0011 | [T-0021](tasks/T-0021/) | app_user |

### Wave 6: Mobile Driver Flow app_taixe

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0022 | P1 | Created | Planned | Driver online offline app_taixe | T-0015, T-0031 | [T-0022](tasks/T-0022/) | app_taixe |
| T-0023 | P1 | Created | Planned | Receive booking offer app_taixe | T-0022, T-0009 | [T-0023](tasks/T-0023/) | app_taixe |
| T-0024 | P1 | Created | Planned | Trip management app_taixe | T-0023, T-0010 | [T-0024](tasks/T-0024/) | app_taixe |
| T-0025 | P2 | Created | Planned | Revenue history app_taixe | T-0024 | [T-0025](tasks/T-0025/) | app_taixe |

### Wave 7: Realtime Integration

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0026 | P2 | Created | Planned | Realtime booking status app_user | T-0020, T-0004 | [T-0026](tasks/T-0026/) | app_user, nestjs_prisma |
| T-0027 | P2 | Created | Planned | Realtime driver location app_taixe | T-0022, T-0004 | [T-0027](tasks/T-0027/) | app_taixe, nestjs_prisma |
| T-0028 | P2 | Created | Planned | Realtime trip tracking app_user | T-0021, T-0027 | [T-0028](tasks/T-0028/) | app_user |

### Wave 8: Polish

| ID | Priority | Phase | Status | Title | Depends On | Folder | Projects |
|----|----------|-------|--------|-------|------------|--------|----------|
| T-0029 | P2 | Created | Planned | Swagger API documentation | T-0006, T-0007, T-0008, T-0010, T-0011, T-0031 | [T-0029](tasks/T-0029/) | nestjs_prisma |
| T-0030 | P2 | Created | Planned | Health check endpoint | T-0003, T-0005 | [T-0030](tasks/T-0030/) | nestjs_prisma |

---

## Dependency Graph

```
Wave 1: Backend Foundation
──────────────────────────────────────────
T-0001 (Backend env) ─┬─→ T-0002 (Prisma schema)
                       ├─→ T-0003 (Redis)
                       ├─→ T-0004 (WebSocket) ── depends on T-0003
                       └─→ T-0031 (Google Maps Service) ── depends on T-0003
T-0005 (API format)    ────────────────────────────────────────

Wave Map: Mapbox & Goong (replaces Google Maps)
──────────────────────────────────────────
T-0050 (Goong backend) ─────────────────── independent (replaces T-0031 internally)
T-0051 (Mapbox setup app_user) ──┬─→ T-0052 (Migrate AppMap)
                                  └─→ T-0055 (Mapbox setup app_taixe)
T-0050 + T-0052 ─→ T-0053 (Goong Autocomplete)
T-0050 + T-0052 ─→ T-0054 (Route display)
T-0052 + T-0053 + T-0054 ─→ T-0056 (Cleanup Google Maps)
                                                                                      
Wave 2: Core Backend APIs
──────────────────────────────────────────
T-0002 + T-0005 ─→ T-0006 (Auth API)
T-0002 + T-0006 ─→ T-0007 (User/Driver APIs)
T-0002 + T-0006 ─→ T-0008 (Booking APIs)
T-0002 + T-0004 + T-0008 ─→ T-0009 (Dispatch)
T-0002 + T-0004 + T-0008 + T-0009 ─→ T-0010 (Trip APIs)
T-0002 + T-0006 + T-0010 ─→ T-0011 (Payment APIs)

Wave 3: Mobile Foundation
──────────────────────────────────────────
T-0012 (Env app_user) ─→ T-0014 (API client app_user)
T-0013 (Env app_taixe) ─→ T-0015 (API client app_taixe)
T-0006 (Backend Auth) ───→ T-0014 + T-0015

Wave 4: Mobile Auth
──────────────────────────────────────────
T-0014 ─→ T-0016 (Login/Register app_user)
T-0015 ─→ T-0017 (Login/Register app_taixe)

Wave 5: Booking Flow app_user
──────────────────────────────────────────
T-0014 + T-0050 ─→ T-0018 (Map + Location Picker + Mapbox/Goong)
T-0018 + T-0008 ─→ T-0019 (Booking Create)
T-0019 + T-0004 ─→ T-0020 (Booking Tracking)
T-0020 + T-0010 + T-0011 ─→ T-0021 (Trip + Payment)

Wave 6: Driver Flow app_taixe
──────────────────────────────────────────
T-0015 + T-0050 ─→ T-0022 (Online/Offline + Mapbox/Goong)
T-0022 + T-0009 ─→ T-0023 (Receive Offer)
T-0023 + T-0010 ─→ T-0024 (Trip Management)
T-0024 ─→ T-0025 (Revenue History)

Wave 7: Realtime
──────────────────────────────────────────
T-0020 + T-0004 ─→ T-0026 (Booking Status)
T-0022 + T-0004 ─→ T-0027 (Driver Location)
T-0021 + T-0027 ─→ T-0028 (Trip Tracking)

Wave 8: Polish
──────────────────────────────────────────
T-0003 + T-0005 ─→ T-0030 (Health Check)
T-0006..T-0011 + T-0031 ─→ T-0029 (Swagger Docs)

Wave Trip Flow: Payment → Driver → Hoàn Thành
──────────────────────────────────────────
T-0062 (BE Booking + Payment) ─┬─→ T-0063 (BE Dispatch) ─→ T-0068 (BE Dispatch Enhancement)
                                └─→ T-0064 (FE app_user Payment)
T-0055 (Mapbox app_taixe) ─┬─→ T-0069 (app_taixe Foundation)
T-0058 (Auth app_taixe) ───┘
T-0068 + T-0069 ─→ T-0070 (app_taixe Trip Flow)
T-0068 + T-0064 ─→ T-0071 (app_user Trip Flow)
T-0068 + T-0070 + T-0071 ─→ T-0072 (Integration)
```

---

## Task Count by Project

| Project | Tasks | Descriptions |
|---------|-------|-------------|
| **nestjs_prisma** | 15 | T-0001→T-0011 + T-0029 + T-0030 + T-0031 + T-0050 |
| **app_user** | 19 | T-0012, T-0014, T-0016, T-0018→T-0021, T-0026, T-0028 + UI: T-0032→T-0038 + Map: T-0051→T-0054 |
| **app_taixe** | 15 | T-0013, T-0015, T-0017, T-0022→T-0025, T-0027 + UI: T-0039→T-0045 + Map: T-0055 |
| **Cross-project** | 3 | T-0026 (app_user+backend), T-0027 (app_taixe+backend), T-0056 (all) |

---

## Booking Flow Map

```
User App (app_user)                    Backend (nestjs_prisma)          Driver App (app_taixe)
─────────────────                      ───────────────────────          ─────────────────────
                                                                        [Online] ─→ gửi GPS
[Login] ─→ Auth API ─────────────────── [Auth] ──────────────────────── [Login]
[Map + Pick]                              │
[Create Booking] ──── POST /bookings ─── [Booking] ─── dispatch ────→ [Offer Popup]
                                          │                              ├─ Accept ──→ [Trip]
[Tracking] ←─ WS booking.status ───── WebSocket ── driver assigned ───┘  │
                                          │                              │ GPS realtime
[Driver trên map] ←─ WS driver.loc ──── Redis Geo ←──────────────────────┘
                                          │
[Arrived Notification] ──────────────── [Trip Start] ←─ PATCH /start ── [Bắt đầu]
[Map theo dõi trip] ←─ WS driver.loc ── [In Progress] ←─ GPS stream ─── [Đang chạy]
[Hóa đơn + Payment] ────────────────── [Trip Complete] ←─ PATCH /complete ── [Kết thúc]
```

---

## Legend

- **Column order**: `ID | Priority | Phase | Status | Title | Depends On | Folder | Projects`
- **Priority**: P0 (blocker) | P1 (high) | P2 (normal) | P3 (low)
- **Phase**: Created | Planning | Contracting | Implementing | Evaluating | Fixing | Reviewing | Closing | Done
- **Status**: Planned | In Progress | Blocked | Done | Cancelled
