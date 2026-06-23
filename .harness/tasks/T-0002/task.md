# T-0002: Prisma schema mở rộng cho booking flow

**Title**: Prisma schema mở rộng cho booking flow  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Mở rộng Prisma schema từ model User thành core models cho booking flow: User (mở rộng role, phone), Customer, Driver, Vehicle, Booking, Trip, Payment, DispatchOffer, AuditLog.

## Files
- `nestjs_prisma/prisma/schema.prisma` (update)
- `nestjs_prisma/prisma/seed.ts` (create)
- `nestjs_prisma/package.json` (update - thêm seed script)

## Models
- User: thêm role, phone, avatar, status
- Customer: gắn với User
- Driver: license, is_online, current_location (JSON lat/lng)
- Vehicle: license_plate, brand, type, capacity
- Booking: pickup/dropoff (lat,lng,address), status lifecycle, pricing
- Trip: route, status, duration, distance
- Payment: amount, status, method, booking relation
- DispatchOffer: offer lifecycle
- AuditLog: action, entity, old/new values

## Success Criteria
- [ ] 9 models defined với relations đúng
- [ ] Migration chạy thành công
- [ ] Seed data: admin user, customer, driver+vehicle
- [ ] Prisma Client generate không lỗi
- [ ] Indexes cho frequent queries

## Dependencies
- T-0001 (env config)
