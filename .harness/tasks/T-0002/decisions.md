# Decisions (Task-Scoped)

**Task ID**: T-0002  
**Date**: 2026-06-23  

---

## Task-Scoped Decisions

### D-T-0002-1: User Role Default = CUSTOMER

| Field | Value |
|-------|-------|
| **Context** | Auth register hiện tại không có field role. Cần backward compatible với RegisterDto hiện tại. |
| **Options Considered** | <ul><li>Default role = CUSTOMER (không đổi code auth)</li><li>Bắt buộc role trong RegisterDto (breaking change)</li></ul> |
| **Decision** | Default role = CUSTOMER |
| **Rationale** | Giữ backward compatibility với auth hiện tại. T-0006 sẽ migrate auth module thêm role support. |
| **Impact** | Mọi user đăng ký qua RegisterDto hiện tại sẽ tự động là CUSTOMER. Cần T-0006 để add role vào register flow. |

### D-T-0002-2: Driver.vehicle_id là nullable @unique

| Field | Value |
|-------|-------|
| **Context** | Driver có thể đăng ký xe sau khi tạo tài khoản. Vehicle cần 1:1 relation với Driver. |
| **Options Considered** | <ul><li>vehicle_id nullable (cho phép driver chưa có xe)</li><li>vehicle_id required (driver phải có xe ngay khi đăng ký)</li></ul> |
| **Decision** | vehicle_id nullable, @unique (đảm bảo 1 driver chỉ có 1 xe) |
| **Rationale** | Flow đăng ký: tạo User → tạo Driver → sau đó add Vehicle. Không nên bắt buộc xe ngay. |
| **Impact** | Driver.vehicle relation optional, các query cần handle trường hợp driver chưa có xe. |

### D-T-0002-3: Booking status có 10 trạng thái

| Field | Value |
|-------|-------|
| **Context** | Cần model đủ trạng thái cho full booking lifecycle: từ khi tạo đến khi thanh toán xong hoặc hủy. |
| **Options Considered** | <ul><li>10 statuses (PENDING → NO_SHOW)</li><li>8 statuses (gộp PAYMENT_PENDING + PAYMENT_COMPLETED vào COMPLETED)</li></ul> |
| **Decision** | 10 statuses tách biệt |
| **Rationale** | Tách payment status ra khỏi booking status giúp logic rõ ràng hơn. Booking.COMPLETED có nghĩa là trip done, PAYMENT_COMPLETED là thanh toán xong. Có thể có case trip completed nhưng payment pending. |
| **Impact** | Booking flow state machine dài hơn nhưng rõ ràng hơn. Các task API cần implement full state transitions. |

### D-T-0002-4: Decimal cho price fields

| Field | Value |
|-------|-------|
| **Context** | Cần lưu giá tiền booking/payment chính xác, tránh lỗi floating point. |
| **Options Considered** | <ul><li>Prisma Decimal (chính xác, nhưng cần convert)</li><li>Integer (lưu bằng cents/smallest unit)</li><li>Float (dễ dùng nhưng sai số)</li></ul> |
| **Decision** | Prisma Decimal @db.Decimal(10, 2) |
| **Rationale** | Chuẩn của Prisma cho tiền tệ. Decimal chính xác, 10 chữ số (đủ cho hàng triệu VND), 2 chữ số thập phân. NestJS serialize Decimal thành string → frontend parse. |
| **Impact** | NestJS controllers cần handle Decimal → number conversion trong response DTO. |

---

## Decisions to Promote

### Candidates for Promotion

- [x] **D-T-0002-4 (Decimal for prices)** → Ảnh hưởng tất cả task liên quan price/payment. Đã promote vào DECISIONS.md.
- [ ] D-T-0002-1 (role default CUSTOMER) — scoped to T-0006 auth migration, không cần promote
- [ ] D-T-0002-2 (vehicle nullable) — scoped to T-0009 driver flow, không cần promote
- [ ] D-T-0002-3 (10 statuses) — scoped to booking flow tasks, đã có trong task spec
