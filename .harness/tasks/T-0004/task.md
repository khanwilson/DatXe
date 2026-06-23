# T-0004: WebSocket gateway cơ bản

**Title**: WebSocket gateway cơ bản  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Setup WebSocket Gateway (Socket.IO). JWT auth cho connection, room/channel pattern (booking:{id}, driver:{id}, user:{id}), heartbeat, disconnect cleanup, events skeleton.

## Files
- `nestjs_prisma/api/common/websocket/websocket.gateway.ts` (create)
- `nestjs_prisma/api/common/websocket/websocket-auth.guard.ts` (create)
- `nestjs_prisma/api/common/websocket/websocket.module.ts` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## Events
- booking.status_changed { bookingId, status }
- driver.location_updated { driverId, lat, lng }
- dispatch.offer { bookingId, pickup, price }
- dispatch.accepted { bookingId, driverId }
- trip.started / trip.completed

## Success Criteria
- [ ] Socket.IO gateway hoạt động
- [ ] JWT auth guard cho connection
- [ ] Room join/leave/broadcast
- [ ] Heartbeat/ping-pong
- [ ] Disconnect cleanup
- [ ] Events có thể emit/broadcast

## Dependencies
- T-0001 (env config)
- T-0003 (Redis cho scaling)
