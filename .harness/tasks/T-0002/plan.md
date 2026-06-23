# Plan

**Task ID**: T-0002  
**Phase**: Planning  
**Created**: 2026-06-23  

---

## Analysis

### Scope Clarification

- **Affected Projects**: nestjs_prisma
- **Affected Files**: 
  - `nestjs_prisma/prisma/schema.prisma` (update)
  - `nestjs_prisma/prisma/seed.ts` (create)
  - `nestjs_prisma/package.json` (update - add seed script)
  - `nestjs_prisma/api/auth/auth.service.ts` (update - extend profile select, backward compat)
- **Estimated Complexity**: High (9 models, 9 enums, relations, seed data, migration)

### Dependencies

- **Previous Tasks**: T-0001 (env config - completed)
- **Blocked By**: None
- **Prerequisites**: PostgreSQL running, DATABASE_URL configured

### Architectural Decisions

1. **User Expansion**: Add `role` enum (CUSTOMER/DRIVER/ADMIN), `phone` (nullable), `avatar` (nullable), `status` enum (ACTIVE/INACTIVE/SUSPENDED) — default role = CUSTOMER to keep auth backward compatible
2. **Customer ↔ Driver Split**: Separate models for Customer and Driver, both @relation to User (1:1)
3. **Vehicle**: Own model linked to Driver (nullable — driver can register vehicle later)
4. **Booking Status Lifecycle**: 10-status enum covering full flow PENDING→ACCEPTED→DRIVER_ARRIVING→IN_PROGRESS→COMPLETED/CANCELLED
5. **Trip**: Created when booking transitions to DRIVER_ARRIVING, tracks route + status
6. **Payment**: Links to Booking, supports multi-method (CASH/CARD/WALLET)
7. **DispatchOffer**: For dispatching logic — driver receives offer, can accept/reject/timeout
8. **AuditLog**: Entity-agnostic audit for booking/trip state changes

### Risks

- **Pre-existing auth module**: AuthService hardcodes `User.findUnique` select fields — must update getProfile to include new fields
- **Migration on non-empty DB**: If dev DB has production-like data, migration needs careful handling — but this is fresh project
- **AuthService register**: Uses `prisma.user.create()` without role — will default to CUSTOMER, which is correct

---

## Implementation Approach

### Step 1: Define Enums
Create 9 enums: UserRole, UserStatus, DriverStatus, VehicleType, BookingStatus, TripStatus, PaymentStatus, PaymentMethod, OfferStatus

### Step 2: Expand User Model
Add role (UserRole, default CUSTOMER), phone (String?), avatar (String?), status (UserStatus, default ACTIVE)

### Step 3: Create Customer Model
id (uuid), userId (FK→User, unique), fullName, phone (nullable), avatar (nullable), createdAt, updatedAt
Relation: Customer → User (1:1, cascade delete)

### Step 4: Create Driver Model
id (uuid), userId (FK→User, unique), fullName, phone, avatar (nullable), licenseNumber, isOnline (default false), currentLocation (nullable, JSON), status (DriverStatus), vehicleId (nullable, FK→Vehicle), createdAt, updatedAt
Relation: Driver → User (1:1, cascade delete), Driver → Vehicle (optional)

### Step 5: Create Vehicle Model
id (uuid), driverId (FK→Driver, unique), licensePlate, brand, model, color, type (VehicleType), capacity, createdAt, updatedAt

### Step 6: Create Booking Model
id (uuid), customerId (FK→Customer), driverId (nullable, FK→Driver), status (BookingStatus), pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress, distance (nullable, Float), estimatedPrice (Decimal), finalPrice (nullable, Decimal), estimatedDuration (nullable, Int), note (nullable), cancelledAt (nullable), cancelReason (nullable), createdAt, updatedAt
Indexes: customerId, driverId, status, (status, driverId), createdAt

### Step 7: Create Trip Model
id (uuid), bookingId (FK→Booking, unique), driverId (FK→Driver), customerId (FK→Customer), status (TripStatus), pickupLat, pickupLng, dropoffLat, dropoffLng, routePolyline (nullable), startOdometer (nullable), endOdometer (nullable), actualDistance (nullable, Float), actualDuration (nullable, Int), startedAt (nullable), completedAt (nullable), cancelledAt (nullable), cancelReason (nullable), createdAt, updatedAt

### Step 8: Create Payment Model
id (uuid), bookingId (FK→Booking, unique), amount (Decimal), method (PaymentMethod), status (PaymentStatus), transactionId (nullable), paidAt (nullable), note (nullable), createdAt, updatedAt

### Step 9: Create DispatchOffer Model
id (uuid), bookingId (FK→Booking), driverId (FK→Driver), status (OfferStatus), expiredAt, respondedAt (nullable), createdAt, updatedAt
Indexes: (bookingId, driverId), (driverId, status), expiredAt

### Step 10: Create AuditLog Model
id (uuid), entityType (String), entityId (String), action (String), oldValues (nullable, JSON), newValues (nullable, JSON), changedById (nullable), changedAt (DateTime, default now)
Indexes: (entityType, entityId), changedAt

### Step 11: Update AuthService
Extend getProfile to include new User fields (role, phone, avatar, status) — backward compatible since RegisterDto doesn't require role

### Step 12: Create seed.ts
Admin user, 3 customers, 2 drivers with vehicles, sample bookings + trips + payments

### Step 13: Update package.json
Add `prisma:seed` and seed config

### Step 14: Run migration & seed
Execute `npx prisma migrate dev`, generate client, seed data

### Step 15: Verify
Check auth service compiles, check lint/typecheck/build

---

## Testing Strategy

- **Manual verification**: Prisma Studio to inspect all 9 models with relations
- **Build check**: `npm run build` passes after schema changes
- **Lint check**: `npm run lint` passes
- **Auth backward compat**: register/login still work with new schema

---

## Estimated Effort

- Planning: 30 min (done)
- Implementation: 2 hours
- Testing: 30 min
- Total: 3 hours

---

## Acceptance Criteria

- [ ] 9 models defined with correct relations, enums, indexes
- [ ] Migration runs successfully (`npx prisma migrate dev`)
- [ ] Prisma Client generates without errors
- [ ] Seed data creates: 1 admin, 3 customers, 2 drivers+vehicles, bookings, trips, payments
- [ ] Auth service compiles with new User fields (backward compatible)
- [ ] No breaking changes to existing APIs
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
