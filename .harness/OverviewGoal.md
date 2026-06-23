# OverviewGoal.md

# Tổng quan mục tiêu & định hướng công nghệ hệ thống đặt xe

Tài liệu này là **nguồn định hướng cấp cao** cho toàn bộ quá trình phát triển hệ thống đặt xe.  
Claude/harness phải đọc tài liệu này trước khi thực hiện bất kỳ task nào để hiểu:

- Đích đến sản phẩm.
- Tầm nhìn kiến trúc.
- Công nghệ đã chốt.
- Chuẩn vận hành production.
- Khuôn mẫu phải tuân thủ khi thiết kế, code, test, review và bàn giao.
- Các tiêu chí chứng minh năng lực với khách hàng/vendor audit.

Tài liệu này **không thay thế task detail**, nhưng mọi task detail phải đi theo định hướng trong tài liệu này.

---

## 1. Bối cảnh dự án

Dự án là hệ thống đặt xe tương tự Grab/Mai Linh, gồm tối thiểu 3 phần chính:

```txt
hethong/
  app_taixe/        # Mobile app dùng expo dành cho tài xế
  app_user/         # Mobile app dùng expo dành cho khách hàng
  nestjs_prisma/    # Backend API/services dùng NestJS + Prisma
```

Hệ thống không được phát triển theo hướng demo UI đơn giản.  
Đích đến là một hệ thống có khả năng tiến tới production thật, có thể vận hành, giám sát, scale, backup, audit và chứng minh năng lực kỹ thuật với khách hàng.

Khách hàng đặc biệt quan tâm đến:

- Realtime dispatch thật.
- Monitoring dashboard thật.
- App stability/crash report thật.
- Load test report.
- Kiến trúc scale rõ ràng.
- Bảo mật.
- Backup & recovery.
- SLA uptime.
- QA process.
- API documentation.
- Source code ownership.
- Đội ngũ và quy trình vận hành.

---

## 2. Tầm nhìn sản phẩm

Hệ thống phải hỗ trợ các nghiệp vụ cốt lõi sau:

### 2.1. Khách hàng

- Đăng ký/đăng nhập.
- Quản lý hồ sơ.
- Chọn điểm đón/điểm đến.
- Ước tính giá.
- Đặt xe.
- Theo dõi tài xế realtime trên bản đồ.
- Nhận thông báo trạng thái chuyến đi.
- Hủy chuyến theo rule.
- Thanh toán.
- Xem lịch sử chuyến.
- Gửi phản hồi/khiếu nại.

### 2.2. Tài xế

- Đăng ký/đăng nhập.
- Cập nhật hồ sơ tài xế/phương tiện.
- Bật/tắt trạng thái online.
- Gửi GPS realtime.
- Nhận cuốc.
- Từ chối/không phản hồi cuốc.
- Bắt đầu chuyến.
- Kết thúc chuyến.
- Xem doanh thu/lịch sử chuyến.
- Nhận thông báo.

### 2.3. Backend/Admin/Vận hành

- Quản lý user.
- Quản lý tài xế.
- Quản lý chuyến đi.
- Quản lý trạng thái dispatch.
- Quản lý thanh toán.
- Quản lý khiếu nại.
- Theo dõi dashboard vận hành.
- Theo dõi realtime drivers/bookings.
- Theo dõi lỗi hệ thống.
- Theo dõi performance.
- Hỗ trợ audit log.

---

## 3. Nguyên tắc thiết kế tổng thể

Mọi task phải tuân thủ các nguyên tắc sau:

### 3.1. Production-first

Không code chỉ để demo.  
Mỗi chức năng cần được thiết kế theo hướng có thể vận hành thật:

- Có validate input.
- Có error handling.
- Có logging.
- Có monitoring signal nếu liên quan backend/mobile.
- Có retry/timeout nếu liên quan network, queue, payment, notification.
- Có test hoặc ít nhất có test plan.
- Có migration rõ ràng nếu thay đổi database.
- Có tài liệu cập nhật nếu thay đổi API/flow.

### 3.2. Scale-ready

Hệ thống phải có khả năng scale dần, không nhất thiết over-engineer ngay từ đầu.

Ưu tiên thiết kế theo hướng:

```txt
MVP chạy tốt
-> Pilot test được
-> Load test được
-> Scale theo từng layer
-> Tách service khi cần
```

Không được thiết kế kiểu monolith rối không thể tách.  
Nhưng cũng không được chia microservice quá sớm khi chưa cần thiết.

### 3.3. Observability-first

Mọi luồng quan trọng phải có khả năng quan sát:

- Request ID / correlation ID.
- Structured logging.
- Error tracking.
- Metrics.
- Dashboard.
- Alert.
- Trace ở những điểm quan trọng.

### 3.4. Security-by-default

Mọi API và dữ liệu nhạy cảm phải được bảo vệ từ đầu:

- Auth rõ ràng.
- Permission rõ ràng.
- Không log token/password/PII nhạy cảm.
- TLS ở production.
- Rate limit.
- Audit log cho thao tác quan trọng.
- Validate dữ liệu đầu vào.

### 3.5. Documentation-as-deliverable

Tài liệu là một phần của sản phẩm, không phải việc phụ.

Mỗi task nếu có thay đổi liên quan API, database, flow, infra, monitoring, security thì phải cập nhật tài liệu tương ứng.

---

## 4. Stack công nghệ đã chốt

### 4.1. Mobile apps

Áp dụng cho:

```txt
hethong/app_user
hethong/app_taixe
```

Công nghệ định hướng:

- React Native / Expo.
- TypeScript.
- Firebase Cloud Messaging cho push notification.
- Sentry cho crash reporting, app stability, error tracking, performance monitoring.
- **Google Maps SDK** (qua `react-native-maps`) cho hiển thị bản đồ, marker, polyline.
- **Google Places API** cho autocomplete địa chỉ và place details.
- **Google Directions API** cho tính route và vẽ polyline.
- **Google Distance Matrix API** cho tính ETA và khoảng cách.
- **Google Geocoding API** cho chuyển đổi tọa độ ↔ địa chỉ.
- Secure storage cho token.
- Environment tách riêng staging/production.

Yêu cầu bắt buộc:

- Có versioning app.
- Có phân biệt staging/production.
- Có error boundary.
- Có Sentry init từ giai đoạn sớm.
- Có tracking release version.
- Không hardcode secret.
- Không log token, OTP, thông tin nhạy cảm.
- GPS update phải có kiểm soát tần suất.
- Background location phải thiết kế cẩn thận để tránh hao pin và lỗi OS policy.

---

### 4.2. Backend

Áp dụng cho:

```txt
hethong/nestjs_prisma
```

Công nghệ định hướng:

- NestJS.
- TypeScript.
- Prisma ORM.
- PostgreSQL.
- PostGIS cho truy vấn địa lý.
- Redis cho cache, realtime state, Redis Geo, rate limit, pub/sub hoặc stream.
- WebSocket Gateway cho realtime communication.
- Queue/event layer bằng Redis Streams ở giai đoạn đầu, có đường mở rộng sang Kafka khi traffic lớn.
- OpenAPI/Swagger cho API documentation.
- Sentry cho backend exception/performance monitoring.

Yêu cầu bắt buộc:

- Module rõ ràng theo domain.
- DTO validation.
- Guard/interceptor/filter rõ ràng.
- Không để business logic rải rác trong controller.
- Prisma migration rõ ràng.
- Không thay đổi schema tùy tiện nếu không có migration.
- Logging có request ID.
- API response thống nhất.
- Error code thống nhất.
- Swagger cập nhật theo API.
- Có seed/dev data nếu cần test flow.

---

### 4.3. Database

Công nghệ chính:

- PostgreSQL.
- PostGIS.
- Prisma Migration.
- TimescaleDB có thể bổ sung nếu cần lưu GPS history lớn/time-series dài hạn.

Nguyên tắc:

- PostgreSQL là source of truth cho nghiệp vụ chính.
- Redis không phải source of truth.
- Redis dùng cho dữ liệu realtime/current state/cache.
- GPS realtime không được ghi trực tiếp toàn bộ vào PostgreSQL theo từng request nếu tần suất cao.
- Dữ liệu GPS nên đi theo hướng async/batch write.

Luồng dữ liệu GPS định hướng:

```txt
Driver App
  -> WebSocket/API Location Ingestion
  -> Redis Geo cập nhật vị trí hiện tại
  -> Redis Streams/Kafka ghi event
  -> Worker batch write
  -> PostgreSQL/TimescaleDB lưu lịch sử cần thiết
```

Các nhóm dữ liệu chính:

- Users.
- Drivers.
- Vehicles.
- Bookings.
- Trips.
- Payments.
- Locations.
- Notifications.
- Audit logs.
- Support tickets.
- Pricing rules.
- Dispatch events.

---

### 4.4. Realtime

Công nghệ đã chốt:

```txt
WebSocket + Redis Geo + Redis Streams
```

Đường mở rộng:

```txt
Kafka khi traffic lớn, cần event durability, analytics, replay, reconciliation.
```

Không chọn cách trả lời mơ hồ như:

```txt
Dùng cloud
Dùng AI
Dùng server mạnh
```

Realtime phải chứng minh được bằng flow thật.

Các realtime use case bắt buộc:

- Tài xế online/offline.
- Tài xế gửi location.
- Khách thấy tài xế di chuyển trên bản đồ.
- Booking status update.
- Dispatch request tới tài xế.
- Tài xế nhận cuốc.
- Timeout nếu tài xế không phản hồi.
- Reassign tài xế.
- Cancel flow.
- Trip started.
- Trip completed.

Yêu cầu kỹ thuật:

- Có heartbeat/ping-pong.
- Có reconnect strategy.
- Có room/channel theo booking/trip/driver.
- Có timeout cho offer nhận cuốc.
- Có idempotency cho accept/cancel quan trọng.
- Có xử lý race condition khi nhiều tài xế/tác vụ cùng phản hồi.
- Có lưu event quan trọng để audit/replay.

---

### 4.5. App Stability & Error Monitoring

Công nghệ đã chốt:

```txt
Sentry
```

Sentry là công cụ chính cho:

- Mobile crash reporting.
- Mobile JS/native error.
- Backend exception tracking.
- Release health.
- Performance monitoring.
- Slow transaction tracking.
- Alert khi lỗi tăng.
- Theo dõi lỗi theo version, device, OS, user/session affected.

Firebase Crashlytics là optional, chỉ tích hợp nếu khách hàng yêu cầu dashboard đúng chuẩn Firebase.  
Mặc định hệ thống chọn **Sentry-first**.

Cấu trúc Sentry project đề xuất:

```txt
sentry organization
  - app-user-mobile
  - app-driver-mobile
  - backend-api
  - admin-web nếu có
```

Tags bắt buộc nên gắn khi phù hợp:

```txt
environment: staging | production
release: app/backend version
app_role: user | driver | admin
platform: ios | android | web | backend
service_name
api_route
booking_id
trip_id
driver_id
user_id
```

Lưu ý bảo mật:

- Không gửi password.
- Không gửi access token.
- Không gửi refresh token.
- Không gửi OTP.
- Không gửi thông tin thanh toán nhạy cảm.
- Không gửi PII không cần thiết.
- Cần cấu hình scrub/mask dữ liệu nhạy cảm trước khi gửi lên Sentry.

Sampling định hướng để kiểm soát chi phí:

```txt
Errors: 100%
Performance traces: 5% - 20%
Session replay: chỉ bật khi có lỗi hoặc sampling thấp
Logs: không đẩy log rác
```

---

### 4.6. Monitoring & Logging

Stack định hướng:

```txt
Prometheus + Grafana + Loki + Alertmanager
```

Mục tiêu:

- Monitoring backend metrics.
- Monitoring infra metrics.
- Monitoring API latency.
- Monitoring error rate.
- Monitoring realtime system.
- Monitoring queue lag.
- Monitoring database/redis.
- Alert cho sự cố quan trọng.

Metrics bắt buộc cần có:

- CPU/RAM/network.
- API response time.
- API p50/p95/p99.
- Error rate.
- Timeout rate.
- Request per second.
- Concurrent users.
- Online drivers.
- Active bookings.
- Booking success rate.
- Dispatch success rate.
- Average dispatch time.
- Redis memory/connection.
- DB connection pool.
- Queue lag.
- Payment callback error.
- Notification failure.

Dashboard cần chuẩn bị để trình khách:

- System overview.
- API performance.
- Booking/dispatch realtime.
- Driver online/location.
- Error overview.
- Mobile stability từ Sentry.
- Infra health.
- Database health.

---

### 4.7. Load Test

Công cụ định hướng:

```txt
k6
```

Yêu cầu:

- Có script load test.
- Có report.
- Có scenario sát nghiệp vụ đặt xe.
- Có target rõ ràng.
- Có threshold pass/fail.

Scenario cần có:

- User login.
- Driver login.
- Driver online.
- Driver GPS update liên tục.
- User tạo booking.
- Dispatch tìm tài xế.
- Driver nhận cuốc.
- User theo dõi booking realtime.
- Cancel/reassign.
- Complete trip.
- Payment callback giả lập.
- Notification giả lập.

Target ban đầu đề xuất:

```txt
p50 < 150ms
p95 < 300ms
p99 < 800ms
error rate < 0.5%
timeout rate < 0.2%
```

Target load test trình khách có thể đặt theo phase:

```txt
Pilot:
  concurrent users: 500 - 1,000
  concurrent drivers: 200 - 500

Pre-production:
  concurrent users: 5,000
  peak users: 8,000+
  requests/sec: 3,000+

Production scale:
  tăng theo capacity planning thực tế
```

---

### 4.8. Cloud/Infrastructure

Định hướng cloud:

```txt
AWS-first
```

Phương án triển khai theo giai đoạn:

#### Giai đoạn đầu/MVP/Pilot

- Docker.
- ECS Fargate hoặc server/container managed.
- RDS PostgreSQL.
- ElastiCache Redis.
- S3.
- ALB.
- CloudWatch hoặc Prometheus/Grafana self-managed.

#### Giai đoạn scale lớn

- EKS/Kubernetes.
- RDS PostgreSQL Multi-AZ.
- ElastiCache Redis cluster.
- MSK Kafka hoặc Kafka managed.
- S3 backup.
- CloudFront CDN.
- IaC bằng Terraform nếu cần.
- Multi-region DR nếu yêu cầu enterprise.

Yêu cầu:

- Environment tách staging/production.
- Secret manager.
- Backup rõ ràng.
- CI/CD rõ ràng.
- Không phụ thuộc tài khoản cá nhân.
- Có runbook deploy/rollback.

---

### 4.9. Security

Công nghệ/nguyên tắc:

- JWT Access Token + Refresh Token.
- Refresh token rotation.
- OAuth2 nếu tích hợp đối tác.
- RBAC cho admin/operator.
- TLS cho toàn bộ production API.
- Rate limit tại API Gateway/backend.
- Audit log cho thao tác nhạy cảm.
- Password hashing bằng argon2 hoặc bcrypt.
- Secure storage cho token mobile.
- 2FA cho admin nếu cần.
- Device binding cho app tài xế nếu cần.
- Input validation ở DTO/schema.
- SQL injection phòng qua ORM + validation.
- Không expose stack trace ở production.

Các khu vực cần audit log:

- Admin login.
- Thay đổi trạng thái tài xế.
- Thay đổi booking/trip.
- Refund/payment adjustment.
- Thay đổi pricing rule.
- Thay đổi role/permission.
- Export dữ liệu.
- Cấu hình hệ thống.

---

### 4.10. Backup & Recovery

Yêu cầu mục tiêu:

```txt
Backup frequency: hàng ngày tối thiểu
RPO: <= 15 phút
RTO: <= 2 giờ
Restore test: định kỳ hàng tháng
```

Nguyên tắc:

- Database có daily backup.
- Có point-in-time recovery nếu production.
- Redis không phải source of truth.
- Object storage bật versioning nếu lưu file quan trọng.
- Backup cross-region nếu yêu cầu cao.
- Có restore test.
- Có runbook khôi phục.

---

### 4.11. SLA & Incident Response

Mục tiêu SLA:

```txt
MVP/Pilot: >= 99.5%
Production ổn định: >= 99.9%
Enterprise phase: >= 99.95%
```

Incident severity:

```txt
SEV1:
  Hệ thống đặt xe chết hoàn toàn.
  Không tạo chuyến được.
  Payment lỗi diện rộng.
  Response <= 15 phút.

SEV2:
  Một chức năng quan trọng lỗi diện rộng.
  Dispatch chậm/lỗi một phần.
  Response <= 30 phút.

SEV3:
  Lỗi ảnh hưởng một nhóm user/driver.
  Response trong giờ làm việc hoặc theo SLA.

SEV4:
  Lỗi nhỏ/UI/report.
  Xử lý theo backlog.
```

Mỗi incident cần ghi:

- Thời gian.
- Ảnh hưởng.
- Nguyên nhân.
- Cách xử lý.
- Cách phòng ngừa.
- Bài học rút ra.

---

### 4.12. Maps & Routing

Hệ thống sử dụng **Google Maps Platform** làm nền tảng bản đồ và routing chính.

#### Công nghệ

| Service | Mục đích |
|---------|----------|
| **Google Maps SDK** (qua `react-native-maps`) | Hiển thị bản đồ, marker (pickup/dropoff/driver), polyline route |
| **Google Places API** | Autocomplete tìm kiếm địa chỉ, place details (tọa độ, địa chỉ đầy đủ) |
| **Google Directions API** | Tính route, vẽ polyline, ETA, hướng dẫn đường đi |
| **Google Distance Matrix API** | Tính khoảng cách/thời gian giữa nhiều điểm |
| **Google Geocoding API** | Chuyển đổi ngược: tọa độ → địa chỉ |

#### API keys & Security

- **Google API key** cấu hình qua environment variable.
- Restrict API key theo HTTP referrer (web) hoặc bundle ID (iOS) / package name (Android) trên Google Cloud Console.
- Không hardcode API key trong source code.
- Chỉ enable các API cần thiết trong Google Cloud Console (Maps SDK, Places, Directions, Distance Matrix, Geocoding).
- Setup billing riêng cho Google Maps Platform, có budget alert.

#### Billing estimate (tham khảo)

| API | Free tier | Scale cost |
|-----|-----------|------------|
| Maps SDK | $200/tháng credit | $7/1000 lượt tải map |
| Places | $200/tháng credit | $17/1000 request |
| Directions | $200/tháng credit | $5/1000 request |
| Distance Matrix | $200/tháng credit | $5/1000 element |

#### Luồng maps trong app

```txt
app_user:
  Home screen
    → Map hiển thị vị trí hiện tại
    → Search pickup/dropoff (Google Places Autocomplete)
    → Marker pickup + dropoff
    → Route polyline (Google Directions)
    → Distance + ETA estimate (Distance Matrix)
  Booking tracking
    → Driver marker di chuyển realtime
    → Route polyline update
  Trip tracking
    → Driver marker + route tracking
    → ETA update

app_taixe:
  Home screen
    → Map hiển thị vị trí hiện tại + khu vực có request
  Offer screen
    → Map hiển thị pickup/dropoff + route estimate
  Trip screen
    → Map navigation, route polyline
```

#### Backend routing service

Backend NestJS sẽ có `RoutingService` wrapper:

- `RoutingService.getDirections(from, to, waypoints?)` → gọi Google Directions API.
- `RoutingService.getDistanceMatrix(origins, destinations)` → gọi Google Distance Matrix API.
- `RoutingService.geocode(lat, lng)` → gọi Google Geocoding API.
- Cache kết quả Directions/Distance Matrix trong Redis (TTL phù hợp) để giảm chi phí API.

#### Yêu cầu kỹ thuật

- Google Maps SDK init phải có fallback UI nếu không load được map (mất mạng, API key lỗi).
- Cache directions response ở backend (Redis, TTL 10-15 phút cho cùng cặp tọa độ).

## 5. Kiến trúc domain định hướng

Các domain/service/module nên có:

```txt
Auth/IAM
User/Profile
Driver
Vehicle
Booking
Trip
Dispatch
Location
Pricing
Payment
Notification
Support/Ticket
Admin
Audit
Monitoring/Health
```

Ở giai đoạn đầu có thể triển khai trong một NestJS backend modular monolith, nhưng boundary phải rõ để sau này tách service.

### 5.1. Module boundary

Mỗi module nên có:

```txt
module
controller
service/use-case
repository/data access
dto
entity/model
mapper nếu cần
test
```

Không để controller xử lý business logic phức tạp.  
Không để service gọi database lung tung qua nhiều domain nếu không có abstraction rõ.

### 5.2. Domain events

Các sự kiện quan trọng nên được thiết kế rõ:

```txt
booking.created
booking.cancelled
dispatch.requested
dispatch.timeout
dispatch.reassigned
driver.location_updated
driver.accepted_booking
trip.started
trip.completed
payment.created
payment.succeeded
payment.failed
notification.sent
notification.failed
```

Giai đoạn đầu có thể dùng Redis Streams/internal event bus.  
Sau này có thể chuyển sang Kafka.

---

## 6. Flow nghiệp vụ quan trọng

### 6.1. Booking/Dispatch flow chuẩn

```txt
1. User tạo booking.
2. Backend validate điểm đón/điểm đến.
3. Pricing estimate được tính hoặc xác nhận.
4. Booking được tạo ở trạng thái pending_dispatch.
5. Dispatch service tìm tài xế gần nhất bằng Redis Geo/PostGIS.
6. Hệ thống gửi offer tới tài xế qua WebSocket/push.
7. Tài xế có thời gian phản hồi.
8. Nếu tài xế accept:
   - lock booking/dispatch offer
   - chuyển booking sang driver_assigned
   - thông báo realtime cho user
9. Nếu tài xế timeout/reject:
   - ghi dispatch event
   - tìm tài xế tiếp theo
10. Nếu không còn tài xế:
   - booking chuyển no_driver_found
   - thông báo user
```

Yêu cầu kỹ thuật:

- Phải chống double-accept.
- Phải có idempotency.
- Phải có timeout rõ.
- Phải có audit event.
- Phải có metric dispatch_success_rate.
- Phải có metric average_dispatch_time.

---

### 6.2. Driver location flow

```txt
1. Driver app gửi GPS theo interval.
2. Backend validate driver đang online.
3. Backend cập nhật vị trí hiện tại vào Redis Geo.
4. Backend emit location update cho booking/trip liên quan.
5. Backend ghi event vào Redis Streams/Kafka.
6. Worker batch write GPS history nếu cần.
```

Yêu cầu:

- Không spam database.
- Có throttle/debounce.
- Có xử lý mất mạng/reconnect.
- Có timestamp từ client và server.
- Có kiểm tra dữ liệu GPS bất thường.
- Không tin tuyệt đối vào client location.

---

### 6.3. Payment flow

```txt
1. Booking/trip tạo payment intent hoặc payment request.
2. Payment connector gọi nhà cung cấp thanh toán.
3. Payment callback nhận kết quả.
4. Backend verify signature/callback.
5. Backend cập nhật payment status.
6. Backend emit payment event.
7. Backend thông báo user/driver/admin nếu cần.
```

Yêu cầu:

- Callback phải idempotent.
- Có signature verification.
- Có retry hoặc reconciliation.
- Có audit log.
- Không log dữ liệu thanh toán nhạy cảm.

---

## 7. Chuẩn API

### 7.1. API style

- REST API trước.
- OpenAPI/Swagger bắt buộc.
- Versioning dạng `/api/v1`.
- Response format thống nhất.
- Error format thống nhất.
- Pagination chuẩn.
- Filtering/sorting rõ ràng.
- Idempotency key cho API quan trọng.

Ví dụ response success:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

Ví dụ response error:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found",
    "details": {}
  },
  "meta": {
    "requestId": "..."
  }
}
```

### 7.2. API bắt buộc cần document kỹ

- Auth.
- User profile.
- Driver profile.
- Driver online/offline.
- Driver location update.
- Booking create/cancel/status.
- Dispatch accept/reject.
- Trip start/complete.
- Payment create/callback/status.
- Notification.
- Admin APIs.
- Health check.

---

## 8. Chuẩn code

### 8.1. TypeScript

- Không dùng `any` tùy tiện.
- Ưu tiên type rõ ràng.
- DTO/schema rõ ràng.
- Tên biến/tên function thể hiện nghiệp vụ.
- Không hardcode magic number nếu không có constant/config.
- Không trộn tiếng Việt và tiếng Anh trong code identifier. Ưu tiên English cho code.

### 8.2. Error handling

- Không throw string.
- Dùng exception class hoặc error code rõ ràng.
- Không expose stack trace ở production.
- Error phải đủ thông tin để debug nhưng không lộ secret/PII.
- Error quan trọng phải gửi Sentry.

### 8.3. Logging

Log cần có:

- requestId.
- userId/driverId nếu phù hợp.
- service/module.
- action.
- status.
- duration.
- errorCode nếu lỗi.

Không log:

- password.
- token.
- OTP.
- payment secret.
- full PII nếu không cần.

### 8.4. Config

- Dùng environment variables.
- Có `.env.example`.
- Không commit `.env`.
- Validate config khi app start.
- Tách config staging/production.

---

## 9. Chuẩn database/migration

- Mọi thay đổi schema phải qua migration.
- Không sửa database thủ công không ghi lại.
- Có naming convention rõ.
- Index cho field query nhiều.
- PostGIS index cho geo query.
- Transaction cho flow quan trọng.
- Lock hoặc optimistic concurrency cho booking/dispatch.
- Soft delete nếu dữ liệu cần audit.
- CreatedAt/UpdatedAt cho entity quan trọng.

Các bảng cần cân nhắc từ đầu:

```txt
users
drivers
vehicles
bookings
trips
driver_locations_current hoặc lưu current ở Redis
driver_location_events/history
payments
notifications
support_tickets
audit_logs
dispatch_offers
dispatch_events
pricing_rules
```

---

## 10. Chuẩn mobile

- App phải có error boundary.
- App phải init Sentry từ bootstrap.
- App phải gửi release/environment lên Sentry.
- App phải xử lý mất mạng.
- App phải xử lý token expired.
- App phải xử lý permission GPS/push notification.
- App tài xế phải xử lý background location theo rule.
- App không được crash khi API lỗi.
- App không hardcode API URL production.
- App phải có staging/prod config.
- App phải có version/build number rõ.
- App phải có fallback UI cho trạng thái lỗi/loading/empty.

---

## 11. CI/CD

Yêu cầu định hướng:

- Git-based workflow.
- Pull request review.
- Lint.
- Type check.
- Test.
- Build.
- Deploy staging.
- Manual approval production nếu cần.
- Rollback plan.

Mobile:

- Expo EAS Build hoặc Fastlane.
- Internal distribution/TestFlight/Google Play Internal Testing.
- Versioning rõ.
- Release notes.

Backend:

- Docker build.
- Migration strategy.
- Deploy staging trước.
- Health check sau deploy.
- Rollback image nếu fail.

---

## 12. QA process

Các loại test cần có:

- Unit test.
- Integration test.
- API test.
- E2E test cho flow chính.
- Regression test.
- Smoke test.
- Load test.
- Security test.
- Mobile device test.
- UAT với khách hàng.

Flow test bắt buộc:

- Đặt xe thành công.
- Không có tài xế.
- Tài xế timeout.
- Tài xế reject.
- Reassign tài xế.
- Tài xế accept.
- Khách hủy.
- Tài xế hủy.
- Trip started.
- Trip completed.
- Payment success.
- Payment fail.
- Notification fail.
- GPS mất/mạng yếu.
- App crash/error handling.

---

## 13. Tài liệu cần duy trì

Trong quá trình phát triển, các tài liệu sau nên được duy trì:

```txt
docs/
  overview/
    OverviewGoal.md
  architecture/
    system-architecture.md
    realtime-architecture.md
    database-architecture.md
    security-architecture.md
  api/
    openapi.yaml hoặc swagger docs
    auth-flow.md
    booking-flow.md
    dispatch-flow.md
    payment-flow.md
  operations/
    monitoring.md
    alerting.md
    backup-recovery.md
    incident-runbook.md
    deployment-runbook.md
  qa/
    test-strategy.md
    load-test-plan.md
    regression-checklist.md
  decisions/
    ADR-xxxx-title.md
  harness/
    tasks/
      T-<number>/
        task.md
        plan.md
        status.md
        decisions.md
        handoff.md
```

---

## 14. Harness/task execution rules cho Claude

Khi Claude thực hiện task, phải tuân thủ quy trình:

```txt
planner -> generator -> evaluator -> contract
```

### 14.1. Planner

Planner phải:

- Đọc OverviewGoal.md trước.
- Đọc task.md.
- Xác định phạm vi ảnh hưởng:
  - app_user
  - app_taixe
  - nestjs_prisma
  - docs
  - infra
- Không đọc toàn bộ repository nếu không cần.
- Chỉ đọc file liên quan trực tiếp.
- Tạo plan rõ ràng.
- Nêu rủi ro.
- Nêu file dự kiến thay đổi.
- Nêu test cần chạy.

### 14.2. Generator

Generator phải:

- Làm đúng phạm vi plan.
- Không tự ý thay đổi ngoài scope.
- Code theo chuẩn trong OverviewGoal.md.
- Nếu phát hiện cần đổi kiến trúc, phải ghi decision.
- Nếu thay đổi API/database/realtime/security, phải cập nhật docs tương ứng.
- Nếu thay đổi mobile/backend, phải đảm bảo Sentry/logging/error handling phù hợp.

### 14.3. Evaluator

Evaluator phải kiểm tra:

- Code có đúng task không.
- Có phá flow hiện có không.
- Có vi phạm security không.
- Có thiếu migration không.
- Có thiếu validation không.
- Có thiếu error handling không.
- Có thiếu logging/Sentry không.
- Có thiếu docs không.
- Có test hoặc test plan không.
- Có ảnh hưởng app_user/app_taixe/backend chéo không.

### 14.4. Contract

Contract phải ghi lại:

- Task đã làm gì.
- File đã thay đổi.
- API thay đổi gì.
- Database thay đổi gì.
- Config/env thay đổi gì.
- Test đã chạy/chưa chạy.
- Rủi ro còn lại.
- Handoff cho task sau.

---

## 15. Definition of Done

Một task chỉ được coi là xong khi đáp ứng các điểm phù hợp dưới đây:

- Code chạy được.
- Không có lỗi TypeScript/lint nghiêm trọng.
- Có validation input.
- Có error handling.
- Có logging/Sentry nếu liên quan lỗi runtime.
- Có migration nếu thay đổi database.
- Có docs nếu thay đổi API/flow/infra/security.
- Có test hoặc test plan.
- Không hardcode secret.
- Không log dữ liệu nhạy cảm.
- Không phá staging/prod config.
- Có ghi status/handoff trong folder task.
- Có nêu rõ phần chưa làm nếu còn thiếu.

---

## 16. Những điều không được làm

Không được:

- Build demo UI giả mà không có flow thật.
- Fake realtime dispatch.
- Ghi GPS tần suất cao trực tiếp vào PostgreSQL mà không có chiến lược async/batch.
- Bỏ qua monitoring/error tracking.
- Bỏ qua Sentry cho lỗi quan trọng.
- Hardcode secret/API key/token.
- Commit `.env`.
- Log password/token/OTP.
- Tự ý đổi schema không migration.
- Tự ý đổi API contract không cập nhật docs.
- Tự ý thêm công nghệ lớn khi chưa có lý do/decision.
- Đọc toàn bộ repo trong mọi task gây tốn context.
- Trả lời mơ hồ kiểu “dùng cloud/server mạnh” khi cần giải pháp kỹ thuật cụ thể.
- Tối ưu premature bằng microservice phức tạp khi modular monolith đủ tốt.
- Bỏ qua rollback/backup khi thay đổi hạ tầng/database.

---

## 17. Vendor audit readiness

Hệ thống cần chuẩn bị để chứng minh với khách các nhóm bằng chứng sau:

### Nhóm 1: Hệ thống vận hành thật

- Dashboard monitoring live.
- Sentry app stability.
- Realtime dispatch demo.
- API performance metrics.
- Mobile CI/CD.
- Device compatibility.

### Nhóm 2: Kiến trúc hệ thống

- Architecture diagram.
- Realtime technology explanation.
- Database architecture.
- API documentation.
- Source code ownership.

### Nhóm 3: Scale

- Load test report.
- Cloud architecture.
- Autoscaling strategy.
- SLA uptime.
- Backup & recovery.

### Nhóm 4: Security & vận hành

- Security architecture.
- Monitoring & alert.
- Incident history/drill.
- QA process.
- Team ownership.

---

## 18. Định hướng trình bày với khách

Thông điệp kỹ thuật chính:

```txt
Chúng tôi không chỉ build app demo.
Chúng tôi thiết kế hệ thống đặt xe theo hướng production-ready, realtime thật, observable, secure, có thể load test, có backup/recovery và có khả năng scale.
```

Thông điệp về realtime:

```txt
Realtime sử dụng WebSocket cho giao tiếp app, Redis Geo cho vị trí tài xế hiện tại, Redis Streams cho event realtime có khả năng xử lý lại, và có đường mở rộng sang Kafka khi traffic lớn.
```

Thông điệp về app stability:

```txt
Hệ thống sử dụng Sentry làm nền tảng App Stability & Error Monitoring chính, theo dõi crash, error, release health, affected users, performance và alert realtime cho cả mobile app và backend.
```

Thông điệp về scale:

```txt
Backend được thiết kế theo modular domain boundary, database dùng PostgreSQL/PostGIS, realtime state dùng Redis, event pipeline có thể mở rộng từ Redis Streams sang Kafka, hạ tầng hướng AWS ECS/EKS, RDS, ElastiCache và monitoring bằng Prometheus/Grafana.
```

---

## 19. Ưu tiên phát triển theo phase

### Phase 1: Foundation

- Setup repo/folder.
- Setup backend NestJS/Prisma.
- Setup app_user/app_taixe.
- Setup env staging/dev.
- Setup auth cơ bản.
- Setup Sentry mobile/backend.
- Setup logging/requestId.
- Setup Swagger.
- Setup database schema base.

### Phase 2: Core booking

- User profile.
- Driver profile.
- Driver online/offline.
- Booking create.
- Dispatch basic.
- Driver accept/reject.
- Booking status realtime.
- Basic trip lifecycle.

### Phase 3: Realtime hardening

- WebSocket Gateway.
- Redis Geo.
- Redis Streams.
- Timeout/reassign.
- Race condition handling.
- Idempotency.
- Location throttling.
- Reconnect handling.

### Phase 4: Production readiness

- Monitoring dashboard.
- Alerting.
- Load test k6.
- Backup/recovery.
- Security hardening.
- QA regression.
- API documentation.
- Deployment/runbook.

### Phase 5: Scale & enterprise

- Kafka option.
- Autoscaling.
- Advanced dispatch.
- Payment reconciliation.
- Admin dashboard.
- Incident drill.
- SLA reporting.
- Vendor audit package.

---

## 20. Kết luận

Mọi quyết định kỹ thuật trong dự án phải phục vụ mục tiêu:

```txt
Hệ thống đặt xe realtime, vận hành được ở production, có khả năng scale, có giám sát, có bảo mật, có backup, có kiểm thử và có tài liệu đủ để khách hàng audit.
```

Claude/harness phải coi tài liệu này là **kim chỉ nam**.  
Nếu một task có nhiều lựa chọn kỹ thuật, phải chọn hướng phù hợp nhất với tài liệu này.  
Nếu cần đi ngược lại tài liệu này, phải ghi rõ lý do vào decision/handoff và chờ xác nhận.
