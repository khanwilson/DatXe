# T-0025: Revenue history app_taixe

**Title**: Revenue history app_taixe  
**Priority**: P2  
**Projects**: app_taixe

## Requirement
Màn hình lịch sử chuyến đi + doanh thu cho driver. Danh sách chuyến đã hoàn thành, tổng doanh thu, số chuyến.

## Files
- `app_taixe/app/(tabs)/history.tsx` (create)
- `app_taixe/src/api/drivers.ts` (update - history API)
- `app_taixe/src/zustand/history-store.ts` (create)

## API
- GET /api/drivers/me/trips -> danh sách chuyến
- GET /api/drivers/me/revenue -> tổng doanh thu

## Success Criteria
- [ ] Danh sách chuyến đã hoàn thành
- [ ] Tổng doanh thu theo ngày
- [ ] Số chuyến trong ngày
- [ ] Pull to refresh

## Dependencies
- T-0024 (trip flow)
