import { ModeTheme } from 'constants/enum';
import React, { useCallback, useContext, useMemo } from 'react';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';
import Default from './colors/default';
import { IAppColor } from './colors/IAppColor';
import Light from './colors/light';
import dimensions from './dimentions';
import { AppFont } from './fonts';

export interface ITheme {
  color: IAppColor,
  dimensions: typeof dimensions.dimensions,
  fontSize: typeof dimensions.fontSize,
  font: typeof AppFont,
  changeTheme: (value?: ModeTheme) => void,
}

const ThemeContext = React.createContext<ITheme>({
  color: Default,
  dimensions: dimensions.dimensions,
  fontSize: dimensions.fontSize,
  font: AppFont,
  changeTheme: (value?: ModeTheme) => null,
});

// Custom hook to use theme context
export const useAppTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeColor = ZustandPersist(useShallow(state => state?.ThemeApp));

  const changeTheme = useCallback((value?: ModeTheme) => {
    const nextValue = value ?? ModeTheme.Dark
    if (nextValue !== themeColor) {
      ZustandPersist.getState().save('ThemeApp', nextValue)
    }
  }, [themeColor])

  const sourceColor = useMemo(() => {
    switch (themeColor) {
      case ModeTheme.Light:
        return Light;
      default:
        return Default;
    }
  }, [themeColor])

  const theme = useMemo((): ITheme => {
    return {
      color: sourceColor,
      dimensions: dimensions.dimensions,
      fontSize: dimensions.fontSize,
      font: AppFont,
      changeTheme,
    }
  }, [changeTheme, sourceColor]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;

