# Task T-0074: Hoàn thiện flow đăng nhập Phone + OTP (app_user trước, app_taixe sau)

## Mô tả

Cả app_user và app_taixe hiện chưa có flow đăng nhập hoàn chỉnh. Cần làm:

1. **Backend (nestjs_prisma)**: Sau khi user nhập SĐT và OTP dev `000000`, BE sinh tài khoản (nếu chưa có) và trả về access token + refresh token.
2. **Frontend (app_user trước)**:
   - Sau khi OTP xác thực thành công, lưu access token vào Zustand store.
   - Khi mở app: check token còn hạn → vào Home, hết hạn → vào màn đăng nhập.
3. **app_taixe**: Làm tương tự vì flow đăng nhập 2 app đang giống nhau.

## Phạm vi

- **nestjs_prisma**: Auth controller/service — endpoint xác thực OTP, sinh tài khoản, phát token.
- **app_user**: Auth flow — gọi API, lưu token vào Zustand, auth navigation guard.
- **app_taixe**: Tương tự app_user.

## Lưu ý

- Làm app_user trước, app_taixe sau (cùng flow).
- OTP dev `000000` đã có sẵn trong mock.
- Token: access token + refresh token, lưu Zustand.
- Navigation: auth guard kiểm tra token khi mở app.
