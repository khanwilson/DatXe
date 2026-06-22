import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps
} from '@gorhom/bottom-sheet';
import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import { useAppTheme } from 'theme/index';

interface IProps extends BottomSheetModalProps {
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  children: React.ReactNode;
  onDismiss?: () => void;
}

export const AppBottomSheet = forwardRef<BottomSheetModal, IProps>((props: IProps, ref: ForwardedRef<BottomSheetModal>) => {
  const { snapPoints = ['60%'], enablePanDownToClose = true, children, onDismiss, ...rest } = props;
  const theme = useAppTheme();

  // Backdrop component
  const renderBackdrop = useMemo(() => {
    return (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        onPress={onDismiss}
      />
    )
  }, [onDismiss]);

  return (
    <BottomSheetModal
      ref={ref}
      enablePanDownToClose={enablePanDownToClose}
      backgroundStyle={{ backgroundColor: theme.color.neutral[900] }}
      handleIndicatorStyle={{ backgroundColor: theme.color.neutral[600] }}
      {...rest}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
    >
      {children}
    </BottomSheetModal>
  );
}
);