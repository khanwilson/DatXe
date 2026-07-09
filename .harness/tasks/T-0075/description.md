# T-0075: VNPay Sandbox End-to-End Wiring (bỏ mock, chạy thật)

## Objective

Thay thế mock hardcode ở `app_user` bằng gọi backend thật, đồng bộ contract FE↔BE, cấu hình `.env` sandbox VNPay chuẩn, đảm bảo user có thể mở URL VNPay sandbox → thanh toán → callback → `Booking.status=PAYMENT_COMPLETED` → app nhận WS `booking.payment_success` và chuyển sang tìm tài xế.

## Bằng chứng lỗi hiện tại

Sandbox VNPay trả `Error - Invalid data format`, mã tra cứu `6aVNQIVGOG` (ảnh user chụp lúc 15:08 09/07/2026).

Root cause tại `app_user/src/api/services/paymentService.ts:19-32`:
```ts
const mockCreateVnpayUrl = async (bookingId: string) => ({
  paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=4500000&vnp_TmnCode=DEMO',
  txnRef: `dev-txn-${bookingId}-${Date.now()}`,
});
// __DEV__ → luôn trả URL fake, thiếu vnp_Version/vnp_Command/vnp_CreateDate/vnp_TxnRef/vnp_SecureHash/… → sandbox reject.
```

## Contract mismatch giữa FE và BE

| Thành phần | FE (`app_user`) hiện tại | BE (`nestjs_prisma`) thực tế |
|---|---|---|
| Endpoint | `POST /payments/vnpay/create-payment-url` | `POST /payments/vnpay` |
| Request body | `{ bookingId }` | `{ booking_id, amount, order_info, client_ip }` |
| Response data | `{ paymentUrl, txnRef }` | `{ payment_id, transaction_id, payment_url }` |
| GET status endpoint | `/payments/:bookingId` | `/payments/:bookingId` |
| GET status response fields | `booking_id`, `transaction_id`, `paid_at` (string) | Prisma Payment (Decimal amount, Date paid_at) |

Nguồn: `app_user/src/api/axios/config.ts:33-36`, `app_user/src/api/services/paymentService.ts`, `nestjs_prisma/api/modules/payment/payment.controller.ts:31-73`, `payment.service.ts`.

## Vấn đề khác đã phát hiện

1. **VNPay credentials chưa có** — `.env` backend còn placeholder `your_tmncode_here` / `your_hash_secret_here` (theo `.env.example:VNPAY_*`). Sandbox reject nếu chưa đăng ký merchant sandbox thật.
2. **`VNPAY_RETURN_URL=http://localhost:3000/...`** — device thật (iOS simulator có thể truy cập, Android emulator dùng `10.0.2.2`, real device cần LAN IP hoặc ngrok). App_user đang trỏ backend `http://192.168.1.20:3000` → return URL cũng phải cùng LAN IP hoặc dùng ngrok/tunnel.
3. **Không có deep link đóng WebView** — `BookingRouteScreen` mở VNPay URL trong browser/WebView. Khi VNPay redirect `vnp_ResponseCode=00` về return URL, app cần biết để đóng WebView và dựa vào WS `booking.payment_success`. Cần scheme deep link hoặc detect URL prefix trong WebView.
4. **URL encoding trong `buildVnpayUrl`** — `vnpay.util.ts:39` dùng `encodeURIComponent: (s) => s` cho signData (không encode) rồi phần cuối trả `querystring.stringify(sorted)` (encode default). VNPay yêu cầu ký data đã encode `%20` chứ không phải `+`. Cần verify: sign data phải khớp URL query cuối cùng, encode nhất quán (thường dùng `encodeURIComponent` rồi replace `%20` không cần).
5. **Test end-to-end chưa có** — chưa có kịch bản: tạo booking → gọi create payment → mở URL → giả lập callback → verify booking status.

## Scope

### app_user (FE)
- Sửa `paymentService.ts`: bỏ mock, gọi endpoint đúng, body/response schema đúng
- Sửa `ENDPOINTS.PAYMENT` trong `config.ts` cho khớp BE
- Truyền `amount`, `order_info`, `client_ip` khi call
- Xử lý deep link / URL detect để đóng WebView khi VNPay redirect về return URL
- Fallback rõ ràng nếu backend chưa cấu hình VNPay (thay vì mock URL fake)

### nestjs_prisma (BE)
- Verify/fix URL encoding trong `vnpay.util.ts` cho khớp spec VNPay (test data mẫu VNPay cung cấp)
- Set `.env` sandbox: `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`, `VNPAY_RETURN_URL` tunnel/LAN
- Verify controller/service unchanged nếu contract đúng; nếu không cần thay đổi thì chỉ config

### Cross
- Tài liệu chạy sandbox: user cần đăng ký merchant sandbox VNPay ở đâu, dán TMN_CODE/HASH_SECRET vào đâu
- Kịch bản test manual: booking → payment → sandbox card test (VNPay cung cấp thẻ test) → callback → WS event

## Out of Scope

- Refund flow production (đã có mock trong `refundPayment`, không đụng)
- Payment methods khác ngoài VNPAY (cash chưa ưu tiên)
- app_taixe không đụng — task này chỉ passenger flow
- Production credentials (chỉ sandbox)

## Dependencies

- T-0062 (BE VNPay module) — Done
- T-0064 (FE booking + payment mock) — Done, nay bỏ mock
- Yêu cầu user cung cấp: TMN_CODE + HASH_SECRET sandbox (từ https://sandbox.vnpayment.vn/devreg)

## Quan hệ với T-0072 (Integration & Realtime Wiring)

T-0072 (P0, Created) cover verify toàn bộ WS + REST wiring FE↔BE cho trip lifecycle. T-0075 cover một phần và chuyển giao phần còn lại cho T-0072:

- **T-0075 cover (T-0072 khỏi làm lại)**:
  - Bỏ `mockCreateVnpayUrl` trong `app_user/src/api/services/paymentService.ts`.
  - Fix FE↔BE contract cho payment REST (`POST /payments/vnpay`, `GET /payments/:bookingId`).
  - Verify end-to-end WS event `booking.payment_success` (AC #4: passenger nhận event và chuyển sang SEARCHING_DRIVER).
- **T-0075 KHÔNG đụng, để T-0072 xử lý**:
  - `runDevMock` trong `app_user/src/api/socket/useBookingSocket.ts:48` (mock driver_assigned + trip.status_changed + driver.location_updated).
  - Simulation stubs bên app_taixe.
  - Verify các WS event còn lại: `trip.status_changed`, `driver.location_updated`, `booking.driver_assigned`, `driver.new_offer`.
  - Trip REST endpoints (driver-arrived / start / complete).

Xem `.harness/tasks/T-0072/description.md`.

## Priority

P0 — user báo lỗi trực tiếp, blocking flow booking end-to-end.

## Acceptance Criteria

1. Ở dev build (device thật hoặc simulator), user tạo booking rồi ấn thanh toán → mở URL sandbox VNPay hợp lệ (không phải fake URL).
2. VNPay sandbox hiển thị form thẻ test (không phải màn `Invalid data format`).
3. Thanh toán bằng thẻ test VNPay thành công → BE nhận callback, `Payment.status=SUCCESSFUL`, `Booking.status=PAYMENT_COMPLETED`.
4. app_user nhận WS `booking.payment_success` và chuyển sang trạng thái tìm tài xế (`SEARCHING_DRIVER`).
5. Nếu thanh toán fail/hủy, app quay lại màn cũ với thông báo lỗi rõ ràng.
6. Không còn `__DEV__` fallback trả URL hardcode.
