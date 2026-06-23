# T-0005: API response format và error handling

**Title**: API response format và error handling  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Thiết lập response format thống nhất. Global exception filter, response interceptor, request ID middleware, structured logging (JSON).

## Files
- `nestjs_prisma/api/common/interceptors/response.interceptor.ts` (create)
- `nestjs_prisma/api/common/filters/http-exception.filter.ts` (create)
- `nestjs_prisma/api/common/middleware/request-id.middleware.ts` (create)
- `nestjs_prisma/api/common/logger/logger.middleware.ts` (create)
- `nestjs_prisma/api/main.ts` (update)

## API Changes
Tất cả responses dùng format mới:
Success: { success: true, data: {}, meta: { requestId } }
Error: { success: false, error: { code, message }, meta: { requestId } }

## Success Criteria
- [ ] Request ID trên mọi request
- [ ] Log structured JSON với requestId, method, url, status, duration
- [ ] Success response format đúng
- [ ] Error response format đúng (mã lỗi theo code, không expose stack trace)
- [ ] Validation pipe global

## Dependencies
None
