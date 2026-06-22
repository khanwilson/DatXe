import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { AppText } from 'components/text/AppText';
import React, { ForwardedRef, forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from 'theme/index';
import { AppBottomSheet } from './AppBottomSheet';

interface IProps {
  onClose: () => void;
}

export const ExampleBottomSheet = forwardRef<BottomSheetModal, IProps>((props: IProps, ref: ForwardedRef<BottomSheetModal>) => {
  const { onClose } = props;
  const theme = useAppTheme();

  return <AppBottomSheet
    ref={ref}
  >
    <BottomSheetScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentContainer}>
        <AppText style={[styles.title, { color: theme.color.textColor.white }]}>
          Bottom Sheet Title
        </AppText>

        <AppText style={[styles.description, { color: theme.color.textColor.subText }]}>
          This is a reusable bottom sheet component integrated with your app theme.
          You can swipe down or tap the backdrop to close.
        </AppText>

        {/* Example Content */}
        <View style={styles.itemsContainer}>
          {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((item, index) => (
            <Pressable
              key={index}
              style={[styles.item, { backgroundColor: theme.color.neutral[800] }]}
              onPress={onClose}
            >
              <AppText style={{ color: theme.color.textColor.white }}>
                {item}
              </AppText>
            </Pressable>
          ))}
        </View>

        {/* Close Button */}
        <Pressable
          style={[styles.closeButton, { backgroundColor: theme.color.neutral[800] }]}
          onPress={onClose}
        >
          <AppText style={{ color: theme.color.textColor.white }}>
            Close
          </AppText>
        </Pressable>
      </View>
    </BottomSheetScrollView>
  </AppBottomSheet>
});

const styles = StyleSheet.create({
  triggerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  itemsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  item: {
    padding: 16,
    borderRadius: 12,
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
});
