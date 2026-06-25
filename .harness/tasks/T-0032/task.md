# T-0032: Onboarding & Welcome Screens - app_user

**Title**: Onboarding & Welcome Screens for Customer App  
**Priority**: P0  
**Projects**: app_user

---

## Requirement

Tạo onboarding flow đẹp cho app khách hàng (app_user) - màn hình chào mừng, giới thiệu tính năng chính, hướng dẫn quyền truy cập, chuẩn bị trước khi đăng nhập.

## Screens Needed

1. **Splash Screen** - Logo Mai Linh, brand colors, 2-3 giây
2. **Welcome Screen 1** - "Đặt xe dễ dàng với Mai Linh"
3. **Welcome Screen 2** - "Giá cả minh bạch, không phí ẩn"
4. **Welcome Screen 3** - "An toàn tuyệt đối cho mỗi chuyến"
5. **Permissions Request** - GPS, notifications, contacts (nếu cần)
6. **Get Started Button** - Navigate to Login/Register

## Design Requirements

- Keep Mai Linh taxi branding (logo, colors: primary red, white, black)
- Modern, clean UI design
- Smooth transitions/animations between screens
- Responsive for different screen sizes
- Gesture-friendly (swipe between welcome screens)
- Clear CTA buttons

## Navigation Flow

```
Splash Screen (2-3s)
    ↓
Welcome Screen 1 → Welcome Screen 2 → Welcome Screen 3
    ↓ (Swipe or Next button)
    ↓
Permissions Request
    ↓
Get Started → Navigate to Login Screen
```

## Dependencies

None (standalone onboarding feature)

## Success Criteria

- [ ] All 5+ screens implemented with proper UI
- [ ] Smooth animations & transitions
- [ ] Mai Linh branding maintained
- [ ] Responsive design (tested on multiple screen sizes)
- [ ] No errors/crashes during onboarding flow
- [ ] User can skip to login if already has account

---

**Created**: 2026-06-25  
**Phase**: Created  
**Status**: Planned
