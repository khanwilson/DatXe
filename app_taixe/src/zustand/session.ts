import { isObject } from 'utils/functions/isObject';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';


// Define the store state type
export interface SessionState {
  ModalDebugStatus?: boolean;
}
// Config store interface
interface IRootState extends SessionState {
  save<K extends keyof SessionState, V extends SessionState[K]>(key: K, value: V, mode?: 'update'): void;
  hydrated: boolean | undefined;
  changeHydrated(zustandReady: boolean): void;
}

const ZustandSession = create<IRootState>()(
  devtools((set, get) => ({
    hydrated: undefined,
    save: (key, value, mode) => {
      const prevState = get()?.[key];
      if (mode && Boolean(prevState) && isObject(value)) {
        if (!(isObject(prevState))) throw new Error(`typeof ${key} maybe not is object`);
        return set({ [key]: { ...prevState as object, ...value as object } });
      }

      return set({ [key]: value });
    },
    changeHydrated: (nextState: boolean) => set({ hydrated: nextState })
  }))
);

export default ZustandSession;