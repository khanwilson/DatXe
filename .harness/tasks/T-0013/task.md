# T-0013: Mobile env config app_taixe

**Title**: Mobile env config app_taixe  
**Priority**: P1  
**Projects**: app_taixe

## Requirement
Thiết lập .env, typed config, API URL, timeout cho app_taixe. Giống app_user.

## Files
- `app_taixe/.env.example` (create)
- `app_taixe/src/config/env.ts` (create)
- `app_taixe/src/api/config.ts` (create)

## Success Criteria
- [ ] .env.example đầy đủ biến
- [ ] Config module validate + typed exports
- [ ] API base URL từ env
- [ ] Phân biệt staging/production

## Dependencies
None
