# T-0006: Auth API cải tiến refresh token

**Title**: Auth API cải tiến refresh token  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Cải tiến auth module: refresh token rotation, register với role (CUSTOMER/DRIVER/ADMIN), login trả về role + user info.

## Files
- `nestjs_prisma/api/auth/auth.service.ts` (update)
- `nestjs_prisma/api/auth/auth.controller.ts` (update)
- `nestjs_prisma/api/auth/dto/` (update)

## API Contract
- POST /api/auth/register -> { accessToken, refreshToken, user: { id, email, role, name } }
- POST /api/auth/login -> { accessToken, refreshToken, user }
- POST /api/auth/refresh -> { accessToken, refreshToken }
- POST /api/auth/logout -> invalidate refresh token

## Success Criteria
- [ ] Register với role + full_name
- [ ] Login trả về role + user info
- [ ] Refresh token rotation (cũ invalid khi dùng mới)
- [ ] Logout + invalidate
- [ ] Format response đúng T-0005

## Dependencies
- T-0002 (Prisma User mở rộng)
- T-0005 (API format)
