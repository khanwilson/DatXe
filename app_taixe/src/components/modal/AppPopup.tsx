import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet';
import React, { ForwardedRef, forwardRef, RefObject, useMemo } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';

interface IProps extends BottomSheetModalProps {
  children: React.ReactNode;
  onDismiss?: () => void;
}

const heightScreen = Dimensions.get('window').height;

export const AppPopup = forwardRef<BottomSheetModal, IProps>((props: IProps, ref: ForwardedRef<BottomSheetModal>) => {
  const { children, onDismiss, ...rest } = props;

  // Backdrop component
  const renderBackdrop = useMemo(() => {
    return (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    )
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['100%']}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      handleComponent={() => null}
      enablePanDownToClose={false}
      enableDynamicSizing={false}
      onDismiss={onDismiss}
      {...rest}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView>
        <TouchableOpacity activeOpacity={1} onPress={() => (ref as RefObject<BottomSheetModal>)?.current?.dismiss()} style={styles.container}>
          {children}
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: heightScreen,
    alignItems: 'center',
    justifyContent: 'center',
  }
});