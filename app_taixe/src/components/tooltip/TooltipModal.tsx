import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Modal, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'theme/index';
import { IAppTooltipProps } from '.';
import { styles } from './tooltip.styles';

interface ITooltipModalProps extends Omit<IAppTooltipProps, 'type'> {
}

export const TooltipModal = React.memo((props: ITooltipModalProps) => {
  const { children, tooltipContent, side, triangularColor, contentSide = 'center' } = props;
  const ref = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [posContent, setPosContent] = useState({ width: 0, height: 0 });
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const onMeasure = useCallback(() => {
    ref.current?.measureInWindow((x, y, w, h) => {
      setPos({ x, y: y + (Platform.OS === 'ios' ? 0 : insets.top), w, h });
      setIsOpen(true);
    });
  }, [insets.top]);

  const onLayoutContent = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPosContent({ width, height });
  }, []);

  const tooltipStyle = useMemo(() => {
    let style;
    let coefficient: number = 0;
    if (contentSide === 'left') {
      coefficient = 1;
    } else if (contentSide === 'right') {
      coefficient = -1;
    }
    const contentSideLeft = (posContent.width / 2 - 20) * coefficient
    const contentSideTop = (posContent.height / 2 - 20) * coefficient
    switch (side) {
      case 'top':
        style = { top: (pos.y - posContent.height - 10) - 1, left: pos.x + pos.w / 2 - posContent.width / 2 };
        return { top: style.top, left: style.left + contentSideLeft };
      case 'bottom':
        style = { top: (pos.y + pos.h + 10) - 1, left: pos.x + pos.w / 2 - posContent.width / 2 };
        return { top: style.top, left: style.left + contentSideLeft };
      case 'left':
        style = { top: pos.y, left: (pos.x - pos.w / 2) };
        return { top: style.top + contentSideTop, left: style.left };
      case 'right':
        style = { top: pos.y - posContent.height / 2 + pos.h / 2, left: (pos.x + pos.w / 2 + posContent.width / 2 + 1) };
        return { top: style.top + contentSideTop, left: style.left };
    }
  }, [pos, side, posContent, contentSide]);

  return (
    <>
      {/* ===== Trigger nằm TRONG layout bình thường ===== */}
      <View ref={ref}>
        <Pressable onPress={onMeasure}>
          {children}
        </Pressable>
        {/* ===== Tooltip overlay ===== */}
        <Modal visible={isOpen} transparent={true} animationType="fade" statusBarTranslucent={true}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: `${theme.color.bg}90` }} // backdrop color
            activeOpacity={1}
            onPress={() => {
              setIsOpen(false);
            }}
          >
            <TriangularView pos={pos} side={side} triangularColor={triangularColor} />
            <View style={[{ position: 'absolute', zIndex: 2 }, tooltipStyle]} pointerEvents="box-none" onLayout={onLayoutContent}>
              {tooltipContent}
            </View>
            <View style={{ position: 'absolute', top: pos.y, left: pos.x, width: pos.w, height: pos.h }} pointerEvents="none">
              {React.cloneElement(children as any, {
                style: [(children as any).props.style],
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </>
  );
})

interface ITriangularViewProps extends Pick<IAppTooltipProps, 'side' | 'triangularColor'> {
  pos: { x: number; y: number; w: number; h: number };
}

const TriangularView = React.memo((props: ITriangularViewProps) => {
  const { side, pos, triangularColor } = props;

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
        return { top: pos.y - pos.h / 2, left: pos.x + (pos.w - 20) / 2 };
      case 'bottom':
        return { top: pos.y + pos.h, left: pos.x + (pos.w - 20) / 2 };
      case 'left':
        return { top: pos.y + 2, left: pos.x - 10 };
      case 'right':
        return { top: pos.y + 2, left: pos.x + pos.w };
    }
  }, [side, pos]);

  return <View style={[{ zIndex: 1, position: 'absolute' }, absoluteStyle]} pointerEvents="box-none">
    <View style={triangularViewStyle} />
  </View>
})
