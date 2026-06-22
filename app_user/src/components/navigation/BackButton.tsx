import { ImageSource } from 'assets/index';
import { RenderImage } from 'components/image/RenderImage';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface IProps {
  source?: any;
  onPress?: () => void
}

export const BackButton = React.memo((props: IProps) => {
  const { source, onPress } = props;

  const _onPress = useCallback(() => {
    onPress ? onPress?.() : router.back()
  }, [onPress])

  return <TouchableOpacity
    style={styles.container}
    hitSlop={{
      top: 10,
      right: 10,
      left: 10,
      bottom: 10
    }}
    onPress={_onPress}
    activeOpacity={0.8}
  >
    <RenderImage svgMode style={{ width: 24, height: 24 }} source={source || ImageSource.ic_arrowLeft} />
  </TouchableOpacity>
})

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
