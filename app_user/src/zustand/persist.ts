import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, ModeTheme } from 'constants/enum';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Define the store state type
export interface PersistState {
  // Theme
  ThemeApp?: ModeTheme;
  // Localization
  Localization?: LANGUAGES;
  // Auth
  accessToken?: string;
  refreshToken?: string;
  // User
  user?: {
    id: string;
    email: string;
    name: string;
  };

  // Actions
  save: <K extends keyof PersistState>(key: K, value: PersistState[K]) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: PersistState['user']) => void;
  logout: () => void;
  reset: () => void;
}

// Create the store with persist middleware
const ZustandPersist = create<PersistState>()(
  persist(
    (set) => ({
      // Generic save function for any key
      save: (key, value) => set({ [key]: value }),

      // Set auth tokens
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      // Set user data
      setUser: (user) => set({ user }),

      // Logout - clear auth data
      logout: () => set({
        accessToken: undefined,
        refreshToken: undefined,
        user: undefined,
      }),

      // Reset all state
      reset: () => set({}),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        ThemeApp: state.ThemeApp,
        Localization: state.Localization,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

export default ZustandPersist;
