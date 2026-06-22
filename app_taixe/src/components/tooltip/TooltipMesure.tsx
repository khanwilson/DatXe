import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { IAppTooltipProps } from '.';
import { styles } from './tooltip.styles';

interface ITooltipMesureProps extends Omit<IAppTooltipProps, 'type'> {
}

const ANIMATION_DURATION = 300;
export const TooltipMesure = React.memo((props: ITooltipMesureProps) => {
  const { children, tooltipContent, side, triangularColor, contentSide = 'center' } = props;
  const ref = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [pos, setPos] = useState({ w: 0, h: 0 });
  const [posContent, setPosContent] = useState({ width: 0, height: 0 });
  const opacity = useSharedValue(0);

  const measure = () => {
    ref.current?.measureInWindow((x, y, w, h) => {
      setPos({ w, h });
    });
  };

  const onLayoutContent = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPosContent({ width, height });
  }, []);

  const tooltipStyle = useMemo(() => {
    let style;
    let coefficient = 0
    if (contentSide === 'left') {
      coefficient = 1
    } else if (contentSide === 'right') {
      coefficient = -1
    }
    const contentSideLeft = (posContent.width / 2 - 20) * coefficient
    const contentSideTop = (posContent.height / 2 - 20) * coefficient
    switch (side) {
      case 'top':
        style = { top: -posContent.height - pos.h + 13, left: -posContent.width / 2 + pos.w / 2 };
        return { top: style.top, left: style.left + contentSideLeft };
      case 'bottom':
        style = { top: pos.h + 9, left: -posContent.width / 2 + pos.w / 2 };
        return { top: style.top, left: style.left + contentSideLeft };
      case 'left':
        style = { top: -posContent.height / 2 + pos.h / 2, left: - posContent.width - 9 };
        return { top: style.top + contentSideTop, left: style.left };
      case 'right':
        style = { top: -posContent.height / 2 + pos.h / 2, left: posContent.width - 8 };
        return { top: style.top + contentSideTop, left: style.left };
    }
  }, [pos, side, posContent, contentSide]);

  useEffect(() => {
    if (isOpen) {
      // Show component first, then fade in
      setShouldRender(true);
      opacity.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else if (shouldRender) {
      // Fade out first, then hide component
      opacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);
    }
  }, [isOpen, opacity, shouldRender]);

  const animatedTooltipStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <>
      {/* ===== Trigger nằm TRONG layout bình thường ===== */}
      <View ref={ref} onLayout={measure}>
        <Pressable onPress={() => {
          setIsOpen(true)
        }}>
          {children}
        </Pressable>
        {/* ===== Tooltip overlay ===== */}
        {shouldRender && (
          <>
            <TriangularView pos={pos} side={side} triangularColor={triangularColor} opacity={opacity} />
            <View
              style={StyleSheet.absoluteFill}
              pointerEvents="box-none"
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => {
                  setIsOpen(false);
                }}
              />
              <Animated.View
                style={[
                  { position: 'absolute' },
                  tooltipStyle,
                  animatedTooltipStyle,
                ]}
                pointerEvents="box-none"
                onLayout={onLayoutContent}
              >
                {tooltipContent}
              </Animated.View>
            </View>
          </>
        )}
      </View>
    </>
  );
})

interface ITriangularViewProps extends Pick<IAppTooltipProps, 'side' | 'triangularColor'> {
  pos: { w: number; h: number };
  opacity: SharedValue<number>;
}

const TriangularView = React.memo((props: ITriangularViewProps) => {
  const { side, pos, triangularColor, opacity } = props;

  const triangularViewStyle = useMemo(() => {
    switch (side) {
      case 'top':
        return { ...styles.triangularViewBottom, borderTopColor: triangularColor };
      case 'bottom':
        return { ...styles.triangularViewTop, borderBottomColor: triangularColor };
      case 'left':
        return { ...styles.triangularViewRight, borderLeftColor: triangularColor };
      case 'right':
        return { ...styles.triangularViewLeft, borderRightColor: triangularColor };
    }
  }, [side, triangularColor]);

  const absoluteStyle = useMemo(() => {
    switch (side) {
      case 'top':
        return { top: -pos.h / 2, left: (pos.w - 20) / 2 };
      case 'bottom':
        return { top: pos.h, left: (pos.w - 20) / 2 };
      case 'left':
        return { top: 2, left: -10 };
      case 'right':
        return { top: 2, left: pos.w };
    }
  }, [side, pos.h, pos.w]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { zIndex: 999, position: 'absolute' },
        absoluteStyle,
        animatedStyle
      ]}
      pointerEvents="box-none"
    >
      <View style={triangularViewStyle} />
    </Animated.View>
  );
})