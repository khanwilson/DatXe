# Contract

**Task ID**: T-0002  
**Phase**: Contracting  
**Created**: 2026-06-23  

---

## Scope

### In Scope

- Mở rộng User model (thêm role, phone, avatar, status)
- Tạo Customer model (1:1 với User)
- Tạo Driver model (1:1 với User, quan hệ với Vehicle)
- Tạo Vehicle model (linked với Driver)
- Tạo Booking model (quan hệ với Customer, Driver)
- Tạo Trip model (quan hệ với Booking, Driver, Customer)
- Tạo Payment model (quan hệ với Booking)
- Tạo DispatchOffer model (cho dispatching logic)
- Tạo AuditLog model (entity-agnostic audit)
- Tạo 9 enums (UserRole, UserStatus, DriverStatus, VehicleType, BookingStatus, TripStatus, PaymentStatus, PaymentMethod, OfferStatus)
- Tạo seed.ts với sample data (1 admin, 3 customers, 2 drivers+vehicles, bookings, trips, payments)
- Update package.json để add `prisma:seed` script
- Update auth.service.ts để include new User fields trong getProfile (backward compatible)
- Run migration và seed

### Out of Scope

- Không tạo API endpoints cho Customer/Driver/Vehicle/Booking/Trip (đó là task riêng)
- Không implement business logic (validation, authorization)
- Không tạo DTOs cho các models mới
- Không modify auth endpoints (RegisterDto/LoginDto giữ nguyên)
- Không add test cases (task này chỉ setup schema)

---

## Allowed Files

```
nestjs_prisma/prisma/schema.prisma (update)
nestjs_prisma/prisma/seed.ts (create)
nestjs_prisma/package.json (update)
nestjs_prisma/api/auth/auth.service.ts (update - extend profile)
.harness/tasks/T-0002/* (task documentation)
```

**Rationale**: Task chỉ liên quan database schema và setup. Không touch các modules khác.

---

## Impacted Projects

- [ ] app_taixe
- [ ] app_user
- [x] nestjs_prisma
- [ ] docs
- [ ] harness

---

## Acceptance Criteria

- [x] 9 models defined với relations, enums, indexes đúng spec
- [x] Migration chạy thành công (`npx prisma migrate dev --name add_booking_flow_models`)
- [x] Prisma Client generate không lỗi
- [x] Seed data tạo đủ: admin user, customers, drivers+vehicles, bookings, trips, payments
- [x] Auth service compile và hoạt động với new User fields (backward compatible)
- [x] No lint errors: `npm run lint`
- [x] TypeScript compiles: `npm run build`
- [x] No breaking changes to existing APIs (RegisterDto/LoginDto giữ nguyên)
- [x] No hard-coded secrets/API keys
- [x] Follows project conventions (PascalCase models, camelCase fields, uuid() @id)
- [x] All changes within Allowed Files

---

## API Contract Changes

### No API Changes

Task này không thay đổi API endpoints. Chỉ mở rộng database schema.

**Note**: `getProfile` sẽ return thêm fields (role, phone, avatar, status) nhưng vẫn backward compatible vì thêm fields mới, không bỏ field cũ.

---

## Database Impact

### Prisma Schema Changes

```prisma
// 9 Enums
enum UserRole { CUSTOMER DRIVER ADMIN }
enum UserStatus { ACTIVE INACTIVE SUSPENDED }
enum DriverStatus { ONLINE OFFLINE SUSPENDED }
enum VehicleType { CAR MOTORBIKE }
enum BookingStatus { PENDING CONFIRMED ACCEPTED DRIVER_ARRIVING IN_PROGRESS COMPLETED CANCELLED PAYMENT_PENDING PAYMENT_COMPLETED NO_SHOW }
enum TripStatus { CREATED DRIVER_EN_ROUTE DRIVER_ARRIVED IN_PROGRESS COMPLETED CANCELLED }
enum PaymentStatus { PENDING SUCCESSFUL FAILED REFUNDED }
enum PaymentMethod { CASH CARD WALLET }
enum OfferStatus { PENDING ACCEPTED REJECTED EXPIRED }

// User model expanded
model User {
  id            String      @id @default(uuid())
  user_name     String      @unique
  password_hash String
  role          UserRole    @default(CUSTOMER)
  phone         String?
  avatar        String?
  status        UserStatus  @default(ACTIVE)
  created_at    DateTime    @default(now())
  updated_at    DateTime    @updatedAt
  customer      Customer?
  driver        Driver?

  @@map("users")
}

// 8 new models (Customer, Driver, Vehicle, Booking, Trip, Payment, DispatchOffer, AuditLog)
// Full schema in schema.prisma
```

### Migrations Required

- [x] `add_booking_flow_models` migration needed
- [x] Seed data backfill (via seed.ts)
- [x] Deployment: offline (run locally, no production data)

---

## Test Strategy

- **Build Check**: `npm run build` passes sau khi add new models
- **Lint Check**: `npm run lint` passes
- **Migration Check**: `npx prisma migrate dev` runs without errors
- **Seed Check**: `npx prisma db seed` creates sample data
- **Auth Backward Compat**: Register endpoint vẫn tạo User với role=CUSTOMER (default), login vẫn work
- **Manual Testing**: Prisma Studio để inspect models + relations
- **Edge Cases**: 
  - User register without role → default CUSTOMER
  - Customer/Driver cascade delete when User deleted
  - Driver.vehicle nullable (driver chưa đăng ký xe)
  - Booking.driver_id nullable (booking chưa được accept)

---

## Sign-off

- **Planner**: Claude Sonnet 4.6
- **Code Owner**: nathan
- **Approved**: Yes
- **Approved At**: 2026-06-23
