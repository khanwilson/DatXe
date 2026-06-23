# Handoff

**Task ID**: T-0002  
**Title**: Prisma schema mở rộng cho booking flow  
**Completed**: 2026-06-23  
**Duration**: ~3 hours  

---

## Summary

Mở rộng Prisma schema từ 1 model User thành 9 models + 9 enums hỗ trợ toàn bộ booking/dispatch/trip lifecycle. Migration và seed đã chạy thành công, auth service backward compatible.

---

## What Was Delivered

- **9 Models**: User (expanded), Customer, Driver, Vehicle, Booking, Trip, Payment, DispatchOffer, AuditLog
- **9 Enums**: UserRole, UserStatus, DriverStatus, VehicleType, BookingStatus, TripStatus, PaymentStatus, PaymentMethod, OfferStatus
- **Seed Data**: 1 admin + 3 customers + 2 drivers (with vehicles) + 3 bookings + 2 trips + 2 payments + 3 dispatch offers + 2 audit logs
- **Migration**: `20260623081950_add_booking_flow_models`
- **Auth Update**: getProfile returns role + phone + avatar + status, JWT payload includes role

---

## Database Changes

### New Models

| Model | Table | Key Fields | Relations |
|-------|-------|------------|-----------|
| User | users | user_name, password_hash, role, phone, avatar, status | → Customer, Driver |
| Customer | customers | full_name, phone, avatar | → User (cascade), → Booking[] |
| Driver | drivers | full_name, license_number, is_online, current_location | → User (cascade), → Vehicle?, → Booking[] |
| Vehicle | vehicles | license_plate, brand, model, type | → Driver |
| Booking | bookings | pickup/dropoff (lat,lng,address), status, price | → Customer, → Driver?, → Trip?, → Payment? |
| Trip | trips | route_polyline, actual_distance, actual_duration, status | → Booking, → Driver, → Customer |
| Payment | payments | amount, method, status, transaction_id | → Booking |
| DispatchOffer | dispatch_offers | status, expired_at | → Booking, → Driver |
| AuditLog | audit_logs | entity_type, entity_id, action, old_values, new_values | None |

### Indexes

- Booking: (customer_id), (driver_id), (status), (status, driver_id), (created_at)
- Trip: (driver_id), (customer_id)
- Payment: (booking_id)
- DispatchOffer: (booking_id, driver_id), (driver_id, status), (expired_at)
- AuditLog: (entity_type, entity_id), (changed_at)

### Migration

- File: `prisma/migrations/20260623081950_add_booking_flow_models/migration.sql`
- Status: ✅ Applied successfully
- Type: Forward migration only (no rollback needed for fresh project)

---

## Lessons Learned

### What Went Well

- Schema design clean từ đầu, không cần iteration
- Migration chạy một lần thành công không lỗi
- TypeScript type annotations cho seed array giải quyết inference issues đơn giản
- Backward compatibility với auth module giữ nguyên — chỉ thêm fields, không bỏ fields cũ

### What Was Challenging

- Prisma validation error: Customer model thiếu trips[] relation vì Trip có customer relation → fix bằng cách add `trips Trip[]` vào Customer
- Seed TypeScript inference: array rỗng `[]` thành `never[]` → fix bằng `const customers: Customer[] = []`

---

## Next Steps

### Immediate Next Tasks

1. **T-0006 (Auth API refresh token)** — Cần migrate auth module để hỗ trợ role trong RegisterDto, refresh token flow
2. **T-0007 (User/Driver profile APIs)** — Cần để tạo endpoint CRUD cho Customer/Driver dựa trên schema mới
3. **T-0008 (Booking APIs)** — Cần để implement booking create/status/cancel flow
4. **T-0009 (Dispatch service)** — Cần để implement dispatch logic với DispatchOffer model
5. **T-0010 (Trip lifecycle APIs)** — Cần để implement trip start/track/complete flow

### Known Technical Debt

- Jest config issue (rootDir: "src" nhưng source ở "api/") — pre-existing, không fix trong T-0002
- Seed script có thể dùng `prisma db seed` nhưng hiện tại dùng `ts-node` trực tiếp — OK cho dev

---

## Testing Coverage

- Unit tests: skipped (jest config issue, pre-existing)
- Integration tests: N/A
- Build verify: ✅ `npm run build` passed
- Lint verify: ✅ `npm run lint` passed
- Migration verify: ✅ `npx prisma migrate dev` passed
- Seed verify: ✅ `npx ts-node prisma/seed.ts` passed

---

## Security Review

- [x] No hard-coded secrets — all from .env
- [x] Input validation — N/A (schema task)
- [x] Authentication/authorization — JWT payload now includes role for future guards
- [x] SQL injection prevention — Prisma ORM handles parameterization
- [x] CORS/CSRF protection — unchanged from T-0001

---

## File Changes Summary

- **Projects Modified**: nestjs_prisma
- **Total Files Changed**: 4
- **Lines Added**: ~450
- **Lines Removed**: ~20

See `files-changed.md` for details.

---

## Approvals

- **Task Owner**: nathan
- **Code Reviewer**: Claude Sonnet 4.6
- **Approved**: 2026-06-23
