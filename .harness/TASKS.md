# Task Registry

**Last Updated**: 2026-06-23  
**Total Tasks**: 31  
**Completed**: 2  
**In Progress**: 0  
**Blocked**: 0

---

## Task Index

### Wave 1: Backend Foundation

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0001 | Backend env config mở rộng | Done | Done | P1 | - | nestjs_prisma | [T-0001](tasks/T-0001/) |
| T-0002 | Prisma schema mở rộng cho booking flow | Done | Done | P1 | T-0001 | nestjs_prisma | [T-0002](tasks/T-0002/) |
| T-0003 | Redis connection và cache service | Done | Done | P1 | T-0001 | nestjs_prisma | [T-0003](tasks/T-0003/) |
| T-0004 | WebSocket gateway cơ bản | Planned | Created | P1 | T-0001, T-0003 | nestjs_prisma | [T-0004](tasks/T-0004/) |
| T-0005 | API response format và error handling | Planned | Created | P1 | - | nestjs_prisma | [T-0005](tasks/T-0005/) |
| T-0031 | Google Maps routing service backend | Planned | Created | P1 | T-0003 | nestjs_prisma | [T-0031](tasks/T-0031/) |

### Wave 2: Core Backend APIs

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0006 | Auth API cải tiến refresh token | Planned | Created | P1 | T-0002, T-0005 | nestjs_prisma | [T-0006](tasks/T-0006/) |
| T-0007 | User và Driver profile APIs | Planned | Created | P1 | T-0002, T-0006 | nestjs_prisma | [T-0007](tasks/T-0007/) |
| T-0008 | Booking create status cancel APIs | Planned | Created | P1 | T-0002, T-0006 | nestjs_prisma | [T-0008](tasks/T-0008/) |
| T-0009 | Dispatch service cơ bản | Planned | Created | P1 | T-0002, T-0004, T-0008 | nestjs_prisma | [T-0009](tasks/T-0009/) |
| T-0010 | Trip lifecycle APIs | Planned | Created | P1 | T-0002, T-0004, T-0008, T-0009 | nestjs_prisma | [T-0010](tasks/T-0010/) |
| T-0011 | Payment APIs cơ bản | Planned | Created | P1 | T-0002, T-0006, T-0010 | nestjs_prisma | [T-0011](tasks/T-0011/) |

### Wave 3: Mobile Foundation

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0012 | Mobile env config app_user | Planned | Created | P1 | - | app_user | [T-0012](tasks/T-0012/) |
| T-0013 | Mobile env config app_taixe | Planned | Created | P1 | - | app_taixe | [T-0013](tasks/T-0013/) |
| T-0014 | Mobile API client app_user | Planned | Created | P1 | T-0012, T-0006 | app_user | [T-0014](tasks/T-0014/) |
| T-0015 | Mobile API client app_taixe | Planned | Created | P1 | T-0013, T-0006 | app_taixe | [T-0015](tasks/T-0015/) |

### Wave 4: Mobile Auth Flow

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0016 | Login Register UI app_user | Planned | Created | P1 | T-0014 | app_user | [T-0016](tasks/T-0016/) |
| T-0017 | Login Register UI app_taixe | Planned | Created | P1 | T-0015 | app_taixe | [T-0017](tasks/T-0017/) |

### Wave 5: Mobile Booking Flow app_user

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0018 | Map và location picker app_user | Planned | Created | P1 | T-0014, T-0031 | app_user | [T-0018](tasks/T-0018/) |
| T-0019 | Booking create screen app_user | Planned | Created | P1 | T-0014, T-0008, T-0018 | app_user | [T-0019](tasks/T-0019/) |
| T-0020 | Booking status tracking app_user | Planned | Created | P1 | T-0019, T-0004 | app_user | [T-0020](tasks/T-0020/) |
| T-0021 | Trip tracking và payment app_user | Planned | Created | P1 | T-0020, T-0010, T-0011 | app_user | [T-0021](tasks/T-0021/) |

### Wave 6: Mobile Driver Flow app_taixe

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0022 | Driver online offline app_taixe | Planned | Created | P1 | T-0015, T-0031 | app_taixe | [T-0022](tasks/T-0022/) |
| T-0023 | Receive booking offer app_taixe | Planned | Created | P1 | T-0022, T-0009 | app_taixe | [T-0023](tasks/T-0023/) |
| T-0024 | Trip management app_taixe | Planned | Created | P1 | T-0023, T-0010 | app_taixe | [T-0024](tasks/T-0024/) |
| T-0025 | Revenue history app_taixe | Planned | Created | P2 | T-0024 | app_taixe | [T-0025](tasks/T-0025/) |

### Wave 7: Realtime Integration

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0026 | Realtime booking status app_user | Planned | Created | P2 | T-0020, T-0004 | app_user, nestjs_prisma | [T-0026](tasks/T-0026/) |
| T-0027 | Realtime driver location app_taixe | Planned | Created | P2 | T-0022, T-0004 | app_taixe, nestjs_prisma | [T-0027](tasks/T-0027/) |
| T-0028 | Realtime trip tracking app_user | Planned | Created | P2 | T-0021, T-0027 | app_user | [T-0028](tasks/T-0028/) |

### Wave 8: Polish

| ID | Title | Status | Phase | Priority | Depends On | Projects | Folder |
|----|-------|--------|-------|----------|-----------|----------|--------|
| T-0029 | Swagger API documentation | Planned | Created | P2 | T-0006, T-0007, T-0008, T-0010, T-0011, T-0031 | nestjs_prisma | [T-0029](tasks/T-0029/) |
| T-0030 | Health check endpoint | Planned | Created | P2 | T-0003, T-0005 | nestjs_prisma | [T-0030](tasks/T-0030/) |

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
T-0014 + T-0031 ─→ T-0018 (Map + Location Picker + Google Maps)
T-0018 + T-0008 ─→ T-0019 (Booking Create)
T-0019 + T-0004 ─→ T-0020 (Booking Tracking)
T-0020 + T-0010 + T-0011 ─→ T-0021 (Trip + Payment)

Wave 6: Driver Flow app_taixe
──────────────────────────────────────────
T-0015 + T-0031 ─→ T-0022 (Online/Offline + Google Maps)
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
```

---

## Task Count by Project

| Project | Tasks | Descriptions |
|---------|-------|-------------|
| **nestjs_prisma** | 14 | T-0001→T-0011 + T-0029 + T-0030 + T-0031 |
| **app_user** | 8 | T-0012, T-0014, T-0016, T-0018→T-0021, T-0026, T-0028 |
| **app_taixe** | 7 | T-0013, T-0015, T-0017, T-0022→T-0025, T-0027 |
| **Cross-project** | 2 | T-0026 (app_user+backend), T-0027 (app_taixe+backend) |

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

- **Status**: Planned | In Progress | Blocked | Done | Cancelled
- **Phase**: Created | Planning | Contracting | Generating | Evaluating | Fixing | Closing | Done
- **Priority**: P0 (blocker) | P1 (high) | P2 (normal) | P3 (low)
