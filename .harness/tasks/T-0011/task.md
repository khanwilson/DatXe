# T-0011: Payment APIs cơ bản

**Title**: Payment APIs cơ bản  
**Priority**: P1  
**Projects**: nestjs_prisma

## Requirement
Tạo PaymentsModule. Khi trip completed -> tạo payment record. API: get payment status, danh sách payment của user.

## Files
- `nestjs_prisma/api/payments/payments.module.ts` (create)
- `nestjs_prisma/api/payments/payments.controller.ts` (create)
- `nestjs_prisma/api/payments/payments.service.ts` (create)
- `nestjs_prisma/api/app.module.ts` (update)

## API Contract
- GET /api/payments/:bookingId -> payment status
- GET /api/payments -> danh sách payment của user
- POST /api/payments/:bookingId/pay -> mock pay (chuyển PROCESSING -> COMPLETED)

## Success Criteria
- [ ] Payment record created khi trip complete
- [ ] API check payment status
- [ ] Danh sách payment phân trang
- [ ] Mock payment flow (CASH + E_WALLET)
- [ ] JWT auth guard

## Dependencies
- T-0002 (Prisma Payment)
- T-0006 (auth)
- T-0010 (Trip complete trigger payment)
