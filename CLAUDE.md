# DatXe Multi-Project Harness

## Cấu trúc Repo

```
hethong/
├── app_taixe/          # Ứng dụng React Native cho tài xế
├── app_user/           # Ứng dụng React Native cho người dùng/khách hàng
├── nestjs_prisma/      # Backend API NestJS + Prisma ORM
└── .harness/           # Task management & project state
    ├── PROJECT_STATE.md
    ├── DECISIONS.md
    ├── TASKS.md
    ├── templates/
    ├── scripts/        # Automation scripts
    ├── tutorial/
    └── tasks/
```

## Vai trò từng Project

| Project | Vai trò | Ngôn ngữ | Framework |
|---------|---------|----------|-----------|
| **app_taixe** | Ứng dụng di động cho tài xế | TypeScript/React Native | Expo/React Native |
| **app_user** | Ứng dụng di động cho khách hàng | TypeScript/React Native | Expo/React Native |
| **nestjs_prisma** | Backend API REST/GraphQL | TypeScript | NestJS + Prisma |

## Quy tắc làm việc Cross-Project

### 1. Quy trình Task

Mỗi task **phải** tuân theo quy trình:

```
Created → Planning → Contracting → Generating → Evaluating → Fixing (nếu cần) → Closing → Done
```

### 2. Không Code Trước Plan & Contract

- **Bắt buộc**: Xác định plan trước khi implement
- **Bắt buộc**: Có contract được chấp nhận trước khi code
- **Bắt buộc**: Contract phải rõ scope, out-of-scope, allowed files, acceptance criteria

### 3. Không Sửa Project Không Liên Quan

- Nếu task chỉ liên quan `app_taixe` + `nestjs_prisma`, **KHÔNG** sửa `app_user`
- Contract phải có `Allowed Files` và `Out of Scope` rõ ràng
- Nếu cần sửa file ngoài allowed files, **PHẢI** dừng lại và hỏi trước

### 4. Kiểm tra API Contract

Nếu task thay đổi API:

- **Frontend** gọi endpoint nào?
- **Request** schema là gì? (body, params, headers)
- **Response** schema là gì?
- **Status codes** là gì?
- API có backward compatible không?
- DTO trên frontend có khớp backend không?

### 5. Kiểm tra Prisma Schema

Nếu task liên quan database:

- Prisma schema có thay đổi không?
- Có migration cần thiết không?
- Database convention hiện tại là gì?
- Có thay đổi relationship không?
- Có thay đổi index không?

### 6. Task Status Management

Mỗi task:

- **PHẢI** có file `status.md` ghi rõ phase hiện tại
- **PHẢI** cập nhật `TASKS.md` index khi có thay đổi status
- **PHẢI** cập nhật `CURRENT_TASK.md` khi task active

### 7. Handoff & Project State Update

Khi task hoàn tất:

- **PHẢI** ghi `handoff.md` với lessons learned, decisions, API changes, Prisma changes
- **PHẢI** cập nhật `.harness/PROJECT_STATE.md` nếu:
  - Thay đổi kiến trúc
  - Thêm/thay đổi API contract
  - Thay đổi Prisma schema hoặc database convention
  - Thay đổi business flow
  - Thêm shared convention
- **PHẢI** promote decision vào `.harness/DECISIONS.md` nếu ảnh hưởng future tasks

### 8. Git & Source Code

- **KHÔNG** push git
- **KHÔNG** xóa source code (trừ khi được yêu cầu rõ ràng)
- **KHÔNG** move/rename source code (trừ khi được yêu cầu rõ ràng)
- Tất cả changes đều local, người dùng sẽ review trước push

### 9. Environment & Dependencies

- Mỗi project quản lý dependencies riêng
- Không thay đổi lockfile hoặc version package tùy tiện
- Nếu cần thêm dependency mới, **PHẢI** ghi rõ trong evaluation & handoff

### 10. Tests & Checks

- **PHẢI** chạy lint, typecheck, test, build trước khi close task
- Nếu project không có script nào, log rõ là skipped (không fail)
- Kiểm tra hard-code secrets, API keys, credentials
- Kiểm tra convention compliance

## Project State Management

Tất cả project state được lưu trong `.harness/`:

- `PROJECT_STATE.md` - Architecture, capabilities, contracts, conventions
- `DECISIONS.md` - Long-term decisions ảnh hưởng multiple tasks
- `TASKS.md` - Task registry & status
- `CURRENT_TASK.md` - Active task reference
- `tasks/T-XXXX/` - Per-task documentation & artifacts

Không có side-effect documentation ở nơi khác.

## Commit Messages & Git History

- Tất cả changes đều local
- Người dùng quyết định khi nào push
- Không tự động commit hoặc push

---

## Model Routing cho Harness Tasks

Phân loại công việc theo mức độ phức tạp để chọn model phù hợp:

### Sonnet 4.6 — Công việc tư duy (thinking tasks)

Dùng cho các phase đòi hỏi phân tích, ra quyết định, implement code:

- **Planning**: Đọc task, phân tích scope, dependencies, risks → tạo `plan.md`
- **Contracting**: Xác định scope, allowed files, acceptance criteria → tạo `contract.md`
- **Generating**: Viết code, sửa logic, tạo files mới, refactor
- **Evaluating**: QA review, kiểm tra acceptance criteria, phân tích test results, tìm bugs
- **Fixing**: Debug, sửa lỗi, resolve conflicts

### Haiku 4.5 — Công việc ghi chép (documentation tasks)

Dùng cho các phase chỉ cập nhật documentation, không cần reasoning phức tạp:

- **Status updates**: Cập nhật `status.md` (chuyển phase, tick checkboxes)
- **Logging**: Cập nhật `files-changed.md`, `implementation.md` summary
- **Handoff documentation**: Điền `handoff.md` từ thông tin đã có
- **Task metadata**: Cập nhật `TASKS.md` index, `PROJECT_STATE.md` (khi không có architectural change)
- **Decisions log**: Cập nhật `decisions.md` task-scoped
- **Evaluation templates**: Điền evaluation checklist từ kết quả đã có

### Rule áp dụng

```
Nếu task đang trong phase Planning/Contracting/Generating/Evaluating/Fixing
→ Dùng Sonnet 4.6

Nếu chỉ cập nhật .md files, log status, document decisions
→ Dùng Haiku 4.5
```

Khi Haiku 4.5 phát hiện vấn đề cần ra quyết định (conflict, risk, architectural choice) → **dừng lại và chuyển sang Sonnet 4.6**. Không tự quyết định những việc ngoài scope documentation.

---

**Last Updated**: 2026-06-23
**Version**: 1.1
