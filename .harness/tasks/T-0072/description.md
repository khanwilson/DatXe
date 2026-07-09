# T-0072: Integration & Realtime Wiring

## Objective

End-to-end integration test and wiring verification between `app_taixe` (driver), `app_user` (passenger), and `nestjs_prisma` (backend) for the full trip lifecycle. Both FE apps now have real WS wiring (T-0070, T-0071); this task confirms bidirectional event flow works correctly with the live backend.

## Context

- T-0070 (app_taixe Trip Flow): Driver side fully wired. WS events: `driver.new_offer` → `driver.offer_response` → `booking.driver_assigned`. REST: PATCH driver-arrived / start / complete.
- T-0071 (app_user Trip Flow): Passenger side wired via `useTripSocket`. Consumes `trip.status_changed` and `driver.location_updated`. `useTripSimulation` replaced.
- T-0068/T-0068.1 (BE): Dispatch, trip state machine, cancellation/retry/cashback all done.

## Scope

Identify and fix any gaps between the frontend event/payload assumptions and what the backend actually emits. This may include:

1. **WS event payload mismatches** — frontend assumes a shape the backend doesn't emit (e.g. field names, nesting, missing fields).
2. **Missing WS emissions** — backend transitions state but doesn't emit the event the frontend listens for.
3. **Trip state machine gaps** — state transitions backend supports vs what frontend expects.
4. **Auth/token wiring** — WS connection uses correct auth token for both apps.
5. **Socket namespace/room wiring** — drivers and passengers join correct rooms; events reach the right clients.
6. **DEV mock removal/toggle** — `runDevMock` in app_user and any simulation stubs in app_taixe should be properly gated (not running in production).

## Known Assumptions to Verify

From T-0071 handoff:
- `trip.status_changed` payload shape assumed by `useTripSocket`
- `driver.location_updated` payload shape assumed by `useTripSocket`
- `booking.driver_assigned` payload shape assumed by OfferScreen / BookingRouteScreen

From T-0070 handoff:
- `driver.new_offer` payload — passed as stringified params to OfferScreen
- `booking.driver_assigned` — received in OfferScreen to extract `tripId`

## Out of Scope

- New UI features
- New backend endpoints
- Payment flow changes
- Driver online/offline stats (T-0073, already done)

## Dependencies

- T-0068 (Done), T-0070 (Done), T-0071 (Done)

## Overlap với T-0075 (VNPay Sandbox E2E)

T-0075 đang chạy song song và cover một phần scope của T-0072. Khi T-0075 done, T-0072 KHÔNG cần verify lại:

- **Mock removal — payment part**: T-0075 xóa `mockCreateVnpayUrl` trong `app_user/src/api/services/paymentService.ts`. T-0072 vẫn phải xử lý `runDevMock` trong `app_user/src/api/socket/useBookingSocket.ts:48` (mock driver_assigned + trip.status_changed + driver.location_updated) và mọi simulation stub bên app_taixe.
- **WS event `booking.payment_success`**: T-0075 AC #4 verify end-to-end passenger nhận event này và chuyển state sang SEARCHING_DRIVER. T-0072 khỏi verify lại event `booking.payment_success` — chỉ cần verify các event còn lại (`trip.status_changed`, `driver.location_updated`, `booking.driver_assigned`, `driver.new_offer`).
- **FE↔BE contract — payment REST**: T-0075 fix contract mismatch cho `POST /payments/vnpay` và `GET /payments/:bookingId`. T-0072 khỏi soi contract payment; chỉ soi WS + trip REST (driver-arrived / start / complete).

Xem `.harness/tasks/T-0075/description.md` để biết chi tiết mock nào đã bỏ.

## Priority

P0 — blocks production readiness of the trip flow.
