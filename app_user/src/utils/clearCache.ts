import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from 'api/axios/queryClient';
import ZustandPersist from 'zustand/index';
import { ZustandSession } from 'zustand/index';

export async function clearAllCache(): Promise<void> {
  // 1. Clear TanStack Query cache
  queryClient.clear();

  // 2. Reset Zustand in-memory state
  ZustandPersist.getState().reset();
  ZustandSession.setState({ ModalDebugStatus: undefined });

  // 3. Wipe all AsyncStorage (covers 'hasSeenOnboarding' + 'app-storage')
  await AsyncStorage.clear();
}
