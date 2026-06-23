# T-0010: Trip lifecycle APIs

**Title**: Trip lifecycle APIs  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Tạo TripsModule. Driver start trip (khi đã accept), complete trip. Gửi location realtime qua WebSocket.

## Files
- `nestjs_prisma/api/trips/trips.module.ts` (create)
- `nestjs_prisma/api/trips/trips.controller.ts` (create)
- `nestjs_prisma/api/trips/trips.service.ts` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## API Contract
- PATCH /api/trips/:id/start -> booking status -> IN_PROGRESS
- PATCH /api/trips/:id/complete -> booking status -> COMPLETED, tính tiền
- GET /api/trips/:id -> trip details
- WS trip.location_updated: { driverId, lat, lng } (từ driver)
- WS trip.location_to_user: { lat, lng } (user nhận)

## Success Criteria
- [ ] Driver start trip (chỉ driver của booking đó)
- [ ] Driver complete trip (chỉ driver)
- [ ] Booking + Trip status cập nhật đúng
- [ ] Driver gửi location realtime
- [ ] User nhận location realtime
- [ ] JWT + role guard

## Dependencies
- T-0002 (Prisma Trip, Booking)
- T-0004 (WebSocket)
- T-0008 (Booking)
- T-0009 (Dispatch)
