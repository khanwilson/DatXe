# T-0073: Backend Driver Online/Offline & Stats API

## Context
app_taixe đang gọi `POST /drivers/online` nhưng bị 404. Backend (T-0068) đã implement:
- `PATCH /drivers/location` - update driver location
- `GET /drivers/:id/location` - get driver location

Nhưng thiếu:
- `POST /drivers/online` - driver go online
- `POST /drivers/offline` - driver go offline  
- `GET /drivers/stats` - get driver stats (trips today, earnings)

## Requirements

### 1. POST /drivers/online
- Set driver status = ONLINE
- Return driver info with online status

### 2. POST /drivers/offline
- Set driver status = OFFLINE
- Return driver info with online status

### 3. GET /drivers/stats
- Return today's stats: trips completed, total earnings
- Scope: authenticated driver only

## Technical Notes
- Driver model đã có `status` field (enum: ONLINE, OFFLINE, SUSPENDED)
- Trip model có `completed_at`, `driver_id`, `fare_amount`
- Add methods vào DispatchService
- Add endpoints vào DispatchController
- Dùng JwtAuthGuard + @CurrentUser() decorator

## Files to Modify
- `nestjs_prisma/api/modules/dispatch/dispatch.service.ts`
- `nestjs_prisma/api/modules/dispatch/dispatch.controller.ts`

## Dependencies
- T-0068 (Done) - Dispatch module foundation
