# Project Interaction Guidelines / Hướng dẫn tương tác Project

## Language Rules / Quy tắc ngôn ngữ
- **Khi người dùng hỏi bằng tiếng Việt → Trả lời bằng tiếng Việt**
- **When user asks in English → Reply in English**
- Luôn match ngôn ngữ của người dùng trong câu hỏi

## Terminal & Package Manager / Terminal và quản lý package
- **Shell**: Sử dụng `zsh` commands
- **Package Manager**: Ưu tiên `yarn` thay vì `npm` khi có thể
  - `npm install` → `yarn add`
  - `npm install --save-dev` → `yarn add -D`
  - `npm run` → `yarn`
  - `npm start` → `yarn start`

## Project Context / Bối cảnh project
- **Framework**: React Native + Expo
- **3D Graphics**: Three.js với @react-three/fiber
- **Navigation**: Expo Router
- **Styling**: StyleSheet từ React Native

## Development Preferences / Ưu tiên phát triển
- Sử dụng TypeScript
- Component-based architecture
- Functional components với hooks
- Proper error handling
- Clean code practices
- **ALL CODE COMMENTS MUST BE IN ENGLISH** - All comments, inline documentation, and code annotations must be written in English only, regardless of the user's language preference for communication
- **ALWAYS USE ABSOLUTE IMPORTS** - Never use relative imports (../ or ../../). Always use absolute imports from project root:
  - `components/*` for components
  - `constants/*` for constants
  - `hooks/*` for hooks
  - `utils/*` for utilities
  - `app/*` for app routes (already configured)
  - Example: `import { Colors } from 'constants/theme'` instead of `import { Colors } from '../constants/theme'`

## File Structure Standards / Chuẩn cấu trúc file
- Components trong `/components/`
- Screens trong `/app/`
- Constants trong `/constants/`
- Hooks trong `/hooks/`
- Assets trong `/assets/`

## 3D Room Project Specifics / Đặc thù project phòng 3D
- Tạo không gian 3D với Three.js
- 2 tường bên + 1 sàn nhà
- Sử dụng expo-gl và @react-three/fiber
- Touch controls cho tương tác
- Lighting và camera positioning

## Animation dùng Reanimated v4
- không sử dụng runJS nữa vì đã decrepted 

---
*Lưu ý: File này giúp AI assistant nhớ các quy tắc và preferences khi làm việc với project CozyFocus*