# Contract

**Task ID**: T-0004  
**Phase**: Contracting  
**Created**: 2026-06-24  

---

## Scope

### In Scope

- **Install packages**: @nestjs/platform-socket.io + socket.io (via `bun add`)
- **WebSocket Module**: `WebSocketModule` with JwtModule import for auth
- **WebSocketAuthGuard**: JWT validation from `handshake.auth.token` or `handshake.query.token`, attaches user to `socket.data.user`
- **WebSocketGateway**: Socket.IO gateway với:
  - CORS config từ env vars
  - JWT auth guard on connection
  - Room join/leave helpers: booking:{id}, driver:{id}, user:{id}
  - Event emitter methods (skeleton) cho 5 event types:
    - `booking.status_changed { bookingId, status }`
    - `driver.location_updated { driverId, lat, lng }`
    - `dispatch.offer { bookingId, pickup, price }`
    - `dispatch.accepted { bookingId, driverId }`
    - `trip.started` / `trip.completed`
  - Heartbeat default (Socket.IO built-in ping/pong)
  - Disconnect cleanup (rooms, socket data)
- **AppModule update**: Import WebSocketModule

### Out of Scope

- Redis adapter cho horizontal scaling (single instance is fine for Phase 1)
- Business logic cho event types (only emitter methods — actual emit calls will be in T-0026, T-0027, etc.)
- Client-side Socket.IO SDK (mobile apps handle in T-0020, T-0022, etc.)
- Socket.IO middleware logic other than JWT auth guard
- Driver online/offline logic (T-0022 covers that)
- Error handling for event emit failures (events are fire-and-forget in Phase 1)
- Rate limiting on WebSocket connections

---

## Allowed Files

```
nestjs_prisma/api/common/websocket/websocket.gateway.ts
nestjs_prisma/api/common/websocket/websocket-auth.guard.ts
nestjs_prisma/api/common/websocket/websocket.module.ts
nestjs_prisma/api/app.module.ts
nestjs_prisma/package.json (auto-update by bun add)
nestjs_prisma/bun.lock (auto-update by bun add)
```

**Rationale**: T-0004 chỉ ảnh hưởng single project nestjs_prisma. Only new files + app.module import + package install.

---

## Impacted Projects

- [ ] app_taixe
- [ ] app_user
- [x] nestjs_prisma
- [ ] docs
- [x] harness

---

## Acceptance Criteria

- [ ] Socket.IO gateway hoạt động (có thể kết nối từ client)
- [ ] JWT auth guard: invalid token bị reject, valid token được accept
- [ ] Room join/leave/broadcast patterns implemented
- [ ] Heartbeat/ping-pong default config
- [ ] Disconnect cleanup (rooms cleanup)
- [ ] Events skeleton có thể emit/broadcast (5 event types)
- [ ] Build passes: `bun run build`
- [ ] Lint passes: `bun run lint`
- [ ] No breaking changes to existing HTTP APIs
- [ ] No hard-coded secrets/API keys
- [ ] All changes within Allowed Files

---

## API Contract Changes

This task adds a WebSocket gateway — no new HTTP endpoints. API changes:

### New WebSocket Connection

```
ws://host:port (Socket.IO — default namespace)
  Handshake: { auth: { token: "Bearer <jwt>" } }
  Auth: JWT validation (401 rejected if invalid)
  Rooms:
    - booking:{bookingId} — booking status updates
    - driver:{driverId} — driver-scoped events
    - user:{userId} — user-scoped events
  Events (emitted from server):
    - booking.status_changed { bookingId, status }
    - driver.location_updated { driverId, lat, lng }
    - dispatch.offer { bookingId, pickup, price }
    - dispatch.accepted { bookingId, driverId }
    - trip.started { bookingId }
    - trip.completed { bookingId }
```

---

## Database Impact

### Prisma Schema Changes

None.

### Migrations Required

- [ ] No migration needed

---

## Test Strategy

- **Manual Testing**: Connect with valid/invalid JWT via Socket.IO client
- **Build Check**: `bun run build` succeeds
- **Lint Check**: `bun run lint` succeeds
- **Edge Cases**: invalid JWT, expired JWT, double disconnect, malformed token, missing token
- **Unit Tests**: Not required for this task (no service logic — infrastructure)

---

## Sign-off

- **Planner**: FRIDAYAIX
- **Code Owner**: nathan
- **Approved**: [x] Yes / [ ] No
- **Approved At**: 2026-06-24
