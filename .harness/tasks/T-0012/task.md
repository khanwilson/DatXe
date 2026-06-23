# T-0012: Mobile env config app_user

**Title**: Mobile env config app_user  
**Priority**: P1  
**Projects**: app_user

## Requirement
Thiết lập .env, typed config, API URL, timeout cho app_user. Dùng expo-constants + react-native-dotenv.

## Files
- `app_user/.env.example` (create)
- `app_user/src/config/env.ts` (create)
- `app_user/src/api/config.ts` (create)

## Config vars
- API_BASE_URL, API_TIMEOUT
- APP_ENV (staging/production)
- SENTRY_DSN (optional, để sau)

## Success Criteria
- [ ] .env.example đầy đủ biến
- [ ] Config module validate + typed exports
- [ ] API base URL từ env
- [ ] Có phân biệt staging/production

## Dependencies
None
