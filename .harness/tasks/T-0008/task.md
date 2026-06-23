# T-0008: Booking create status cancel APIs

**Title**: Booking create status cancel APIs  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Tạo BookingsModule. API: tạo booking (pickup/dropoff), get booking details, cancel booking, danh sách booking của user.

## Files
- `nestjs_prisma/api/bookings/bookings.module.ts` (create)
- `nestjs_prisma/api/bookings/bookings.controller.ts` (create)
- `nestjs_prisma/api/bookings/bookings.service.ts` (create)
- `nestjs_prisma/api/bookings/dto/` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## API Contract
- POST /api/bookings -> { pickupAddress, pickupLat, pickupLng, dropoffAddress, dropoffLat, dropoffLng, paymentMethod }
- GET /api/bookings -> danh sách booking của user (có phân trang)
- GET /api/bookings/:id -> chi tiết (kèm driver info nếu có)
- PATCH /api/bookings/:id/cancel -> { reason }

## Success Criteria
- [ ] Tạo booking với pickup/dropoff
- [ ] Booking status lifecycle
- [ ] Hủy booking (chỉ khi chưa có driver)
- [ ] Danh sách booking phân trang
- [ ] DTO validation
- [ ] JWT auth guard

## Dependencies
- T-0002 (Prisma Booking)
- T-0006 (auth)
