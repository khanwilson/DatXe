# T-0009: Dispatch service cơ bản

**Title**: Dispatch service cơ bản  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Tạo DispatchModule. Khi booking created -> tìm driver gần pickup (PostGIS), tạo DispatchOffer, gửi offer qua WebSocket. Xử lý accept/reject/timeout/reassign 3 lần.

## Files
- `nestjs_prisma/api/dispatch/dispatch.module.ts` (create)
- `nestjs_prisma/api/dispatch/dispatch.service.ts` (create)
- `nestjs_prisma/api/dispatch/dto/` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## API Contract
- WS event dispatch.offer: { bookingId, pickup, price, driverId }
- WS event dispatch.accept: { offerId } -> lock booking
- WS event dispatch.reject: { offerId } -> find next driver
- timeout 30s -> reject tự động -> reassign (max 3 tries)

## Success Criteria
- [ ] Tìm driver online gần pickup (PostGIS query)
- [ ] Tạo DispatchOffer, gửi qua WS
- [ ] Accept -> lock booking, cập nhật status
- [ ] Reject/timeout -> tìm driver tiếp theo
- [ ] No driver found -> booking status NO_DRIVER_FOUND
- [ ] Chống double-accept
- [ ] Có timeout 30s

## Dependencies
- T-0002 (Prisma Driver, DispatchOffer)
- T-0004 (WebSocket)
- T-0008 (Booking APIs)
