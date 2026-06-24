# Decisions (Task-Scoped)

**Task ID**: T-0004  
**Date**: 2026-06-24  

---

## Task-Scoped Decisions

These decisions only affect this task and are not promoted to global `DECISIONS.md`.

### D-T-0004-1: JWT Validation in handleConnection

| Field | Value |
|-------|-------|
| **Context** | Need to authenticate WebSocket connections before allowing message subscriptions |
| **Options Considered** | <ul><li>@UseGuards(WebSocketAuthGuard) on @SubscribeMessage handlers</li><li>Middleware in Socket.IO adapter</li><li>Direct JWT validation in handleConnection</li></ul> |
| **Decision** | Constructor-inject JwtService into gateway and validate in handleConnection |
| **Rationale** | Reject bad connections before any event subscription. Guard approach would let connections through for unauthorized events. Middleware approach is Socket.IO-specific and less NestJS-idiomatic. |
| **Impact** | WebSocketAuthGuard still available for per-message auth if needed later |

### D-T-0004-2: Separate JwtModule in WebSocketModule

| Field | Value |
|-------|-------|
| **Context** | AuthModule's JwtModule is not @Global, so WebSocketModule can't use it directly |
| **Options Considered** | <ul><li>Make AuthModule's JwtModule global</li><li>Register separate JwtModule in WebSocketModule</li><li>Export JwtModule from AuthModule and import AuthModule in WebSocketModule</li></ul> |
| **Decision** | Register separate JwtModule in WebSocketModule with same config |
| **Rationale** | Avoids circular dependency risk and keeps WS module self-contained. Config is identical (reads same JWT_SECRET env). |
| **Impact** | Duplicate JwtModule registration, but each shares same config. Negligible overhead. |

### D-T-0004-3: No Redis Adapter in Phase 1

| Field | Value |
|-------|-------|
| **Context** | Production WebSocket horizontal scaling requires Redis adapter (or similar pub/sub) |
| **Options Considered** | <ul><li>Add @nestjs/platform-socket.io-redis adapter now</li><li>Skip for Phase 1, add later</li></ul> |
| **Decision** | Skip Redis adapter for Phase 1 |
| **Rationale** | Single-instance Socket.IO works without adapter. Adding now would require Redis pub/sub channels on top of existing Redis connection (T-0003). Can be added in a focused follow-up task. |
| **Impact** | WS events only broadcast within a single server instance. Add Redis adapter before deploying multiple backend instances. |

---

## Decisions to Promote

### Candidates for Promotion

- [ ] D-T-0004-3 — No Redis adapter affects future scalability planning
