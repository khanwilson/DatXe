import { AppText } from 'components/text/AppText';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

interface IProps {
  style?: object;
  onFPSUpdate?: (fps: number) => void;
}

export const FPSCounter = React.memo((props: IProps) => {
  const { style, onFPSUpdate } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++;
      const currentTime = Date.now();

      if (currentTime - lastTimeRef.current >= 1000) { // Update FPS every second
        const currentFps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
        setFps(currentFps);
        onFPSUpdate?.(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationRef.current = requestAnimationFrame(updateFPS);
    };

    animationRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onFPSUpdate]); // onFPSUpdate as dependency

  return (
    <AppText style={[styles.fpsCounter, style]}>
      FPS: {fps}
    </AppText>
  );
});

const createStyles = (theme: ITheme) => StyleSheet.create({
  fpsCounter: {
    color: theme.color.textColor.white,
    position: 'absolute' as const,
    top: theme.dimensions.p20,
    right: theme.dimensions.p20,
    zIndex: 1000,
    fontSize: theme.fontSize.p16,
    fontWeight: 'bold' as const,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: theme.dimensions.p6,
    borderRadius: theme.dimensions.p4,
    minWidth: 70,
    textAlign: 'center' as const,
  },
});