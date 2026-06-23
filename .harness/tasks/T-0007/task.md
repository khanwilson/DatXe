# T-0007: User và Driver profile APIs

**Title**: User và Driver profile APIs  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Tạo UsersModule và DriversModule. User: GET/PATCH profile. Driver: GET/PATCH, thêm vehicle, driver online/offline status.

## Files
- `nestjs_prisma/api/users/users.module.ts` (create)
- `nestjs_prisma/api/users/users.controller.ts` (create)
- `nestjs_prisma/api/users/users.service.ts` (create)
- `nestjs_prisma/api/drivers/drivers.module.ts` (create)
- `nestjs_prisma/api/drivers/drivers.controller.ts` (create)
- `nestjs_prisma/api/drivers/drivers.service.ts` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## API Contract
- GET /api/users/me -> user profile
- PATCH /api/users/me -> update { fullName, phone, avatar }
- GET /api/drivers/me -> driver + vehicle info
- PATCH /api/drivers/me -> update driver info
- POST /api/drivers/vehicle -> register vehicle { plate, brand, model, color, type }
- PATCH /api/drivers/online -> toggle online status

## Success Criteria
- [ ] User profile API (GET/PATCH)
- [ ] Driver profile API (gắn với User)
- [ ] Vehicle registration
- [ ] Online/offline toggle
- [ ] JWT auth guard
- [ ] DTO validation

## Dependencies
- T-0002 (Prisma models)
- T-0006 (auth/JWT guard)
