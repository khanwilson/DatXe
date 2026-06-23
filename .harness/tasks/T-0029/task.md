# T-0029: Swagger API documentation

**Title**: Swagger API documentation  
**Priority**: P2  
**Projects**: nestjs_prisma

## Requirement
Hoàn thiện Swagger docs cho tất cả endpoints: Auth, Users, Drivers, Bookings, Trips, Payments, Health. Group tags, bearer auth, DTO decorators @ApiProperty.

## Files
- `nestjs_prisma/api/main.ts` (update - Swagger config)
- All DTO files (update - thêm @ApiProperty)

## Success Criteria
- [ ] Swagger UI tại /docs
- [ ] Group APIs theo tags
- [ ] Bearer auth security scheme
- [ ] DTO @ApiProperty đầy đủ
- [ ] API info: title, version, description

## Dependencies
- T-0006 (Auth APIs)
- T-0007 (User/Driver APIs)
- T-0008 (Booking APIs)
- T-0010 (Trip APIs)
- T-0011 (Payment APIs)
