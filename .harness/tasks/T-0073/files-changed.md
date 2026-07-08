# Files Changed: T-0073

| File | Change | Reason |
|------|--------|--------|
| nestjs_prisma/api/modules/dispatch/dispatch.service.ts | Added imports (NotFoundException), added goOnline, goOffline, and getDriverStats methods | Implementation of required service functionality |
| nestjs_prisma/api/modules/dispatch/dispatch.controller.ts | Added Post import, added POST /drivers/online, POST /drivers/offline, and GET /drivers/stats endpoints | Implementation of required API endpoints |