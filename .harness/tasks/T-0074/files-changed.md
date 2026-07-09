# Files Changed: T-0074

| File | Change | Reason |
|------|--------|--------|
| nestjs_prisma/api/auth/auth.service.ts | Modified | Added OTP methods (requestOtp, verifyOtp, refreshToken, logout) and RedisService injection |
| nestjs_prisma/api/auth/auth.controller.ts | Modified | Added OTP endpoints (POST /auth/otp/request, POST /auth/otp/verify, POST /auth/refresh, POST /auth/logout) |
| nestjs_prisma/api/auth/auth.module.ts | Modified | Imported RedisModule for RedisService injection |
| nestjs_prisma/api/auth/types/jwt-payload.type.ts | Modified | Added phone and role properties to JWT payload |
| nestjs_prisma/api/auth/dto/request-otp.dto.ts | Created | DTO for OTP request with phone validation |
| nestjs_prisma/api/auth/dto/verify-otp.dto.ts | Created | DTO for OTP verification with phone and code |
| nestjs_prisma/api/auth/dto/refresh-token.dto.ts | Created | DTO for refresh token requests |
| nestjs_prisma/api/auth/dto/otp-response.dto.ts | Created | DTO for OTP request response |
| nestjs_prisma/api/auth/dto/otp-verify-response.dto.ts | Created | DTO for OTP verification response |
| nestjs_prisma/api/auth/dto/refresh-response.dto.ts | Created | DTO for refresh token response |
| app_user/app/index.tsx | Modified | Added auth navigation guard to check for access token after splash |
| app_user/src/api/axios/interceptors.ts | Modified | Added token refresh logic on 401 responses |
| app_taixe/app/index.tsx | Modified | Added auth navigation guard to check for access token after splash |
| app_taixe/src/api/axios/interceptors.ts | Modified | Added token refresh logic on 401 responses |
| nestjs_prisma/api/auth/auth.service.ts | Modified (FIX) | Fixed inverted OTP verification logic to properly secure production environment |
| app_user/src/api/axios/interceptors.ts | Modified (FIX) | Fixed Array type syntax to resolve ESLint warning |
| app_taixe/src/api/axios/interceptors.ts | Modified (FIX) | Fixed Array type syntax to resolve ESLint warning |