# Plan

**Task ID**: T-0004  
**Phase**: Planning  
**Created**: 2026-06-24  

---

## Analysis

### Scope Clarification

- Affected Projects: nestjs_prisma
- Affected Files:
  - `nestjs_prisma/api/common/websocket/websocket.gateway.ts` (create)
  - `nestjs_prisma/api/common/websocket/websocket-auth.guard.ts` (create)
  - `nestjs_prisma/api/common/websocket/websocket.module.ts` (create)
  - `nestjs_prisma/api/app.module.ts` (update)
- Estimated Complexity: Medium

### Dependencies

- Previous Tasks: T-0001 (env config — JWT_SECRET, REDIS_* vars), T-0003 (Redis)
- External Dependencies: @nestjs/platform-socket.io, socket.io (need to install)
- Blocked By: None

### Risks

- **Risk 1**: Socket.IO namespace conflict with existing HTTP routes → Mitigation: Use separate Socket.IO path /socket.io (default), HTTP still serves on /api/v1 prefix
- **Risk 2**: JWT auth when socket connects from non-auth context → Mitigation: Pass JWT token in handshake.auth.token or handshake.query.token; reject connection if invalid
- **Risk 3**: Redis adapter not ready in Phase 1 → Mitigation: Skip Redis adapter in Phase 1 (basic single-instance Socket.IO works fine). Add Redis adapter in a follow-up task when scaling is needed.

---

## Implementation Approach

### Step 1: Install packages
Run `bun add @nestjs/platform-socket.io socket.io` inside nestjs_prisma directory. Socket.IO ships its own types, no @types/socket.io needed.

### Step 2: Create WebSocketAuthGuard
File: `api/common/websocket/websocket-auth.guard.ts`
- Implement `CanActivate` interface
- Extract JWT from `socket.handshake.auth.token || socket.handshake.query.token`
- Validate using `@nestjs/jwt` JwtService (same JWT_SECRET as HTTP auth)
- Attach decoded user payload to `socket.data.user`
- Return true/false to allow/reject connection

### Step 3: Create WebSocketGateway
File: `api/common/websocket/websocket.gateway.ts`
- Decorate with `@WebSocketGateway()` (no namespace — default namespace)
- Implement `OnGatewayInit`, `OnGatewayConnection`, `OnGatewayDisconnect`
- **handleConnection**: Run JWT validation, assign user to socket.data. Reject if invalid
- **Room helpers**: Methods to join/leave room patterns:
  - `joinBookingRoom(socket, bookingId)` → `socket.join(booking:{id})`
  - `joinDriverRoom(socket, driverId)` → `socket.join(driver:{id})`
  - `joinUserRoom(socket, userId)` → `socket.join(user:{id})`
- **handleDisconnect**: Clean up — remove from rooms, optionally update driver online status
- **Event emitters** (skeleton methods — can be called by services):
  - `emitBookingStatusChanged(bookingId, status)` — emit to `booking:{id}` room
  - `emitDriverLocationUpdated(driverId, lat, lng)` — emit to relevant rooms
  - `emitDispatchOffer(bookingId, data)` — emit to drivers room
  - `emitDispatchAccepted(bookingId, driverId)` — emit to `booking:{id}` room
  - `emitTripEvent(bookingId, event, data)` — emit to `booking:{id}` room
- **Heartbeat**: Socket.IO built-in ping/pong via gateway options
- Configure `cors` in gateway options (allow origins same as CORS_ORIGINS)

### Step 4: Create WebSocketModule
File: `api/common/websocket/websocket.module.ts`
- Import `JwtModule` (to validate JWT tokens in the guard)
- Import `ConfigModule` (to read JWT_SECRET)
- Provide `WebSocketGateway`, `WebSocketAuthGuard`
- Export `WebSocketGateway` so other modules can inject it to emit events
- NOTE: JwtModule is registered in AuthModule, so WebSocketModule needs its own JwtModule.registerAsync or AuthModule import

### Step 5: Update AppModule
- Import `WebSocketModule` in `app.module.ts`

---

## Testing Strategy

- **Manual testing**: Connect via Socket.IO client with valid/invalid JWT, verify room join/leave, verify event emission
- **Edge cases**: Invalid JWT → connection rejected; expired JWT → handled correctly; double disconnect → no crash; malformed token → guard returns false
- **Build check**: `bun run build` must pass
- **Lint check**: `bun run lint` must pass

---

## Estimated Effort

- Planning: 30 min
- Implementation: 2 hours
- Testing: 30 min
- Total: 3 hours

---

## Acceptance Criteria

- [ ] Socket.IO gateway hoạt động (có thể kết nối)
- [ ] JWT auth guard cho connection (invalid token bị reject)
- [ ] Room join/leave/broadcast patterns implemented
- [ ] Heartbeat config đúng (Socket.IO default ping/pong)
- [ ] Disconnect cleanup (rooms cleanup, socket data cleanup)
- [ ] Events skeleton có thể emit/broadcast (5 event types)
- [ ] Build passes with `bun run build`
- [ ] Lint passes with `bun run lint`
- [ ] No breaking changes to existing HTTP APIs
