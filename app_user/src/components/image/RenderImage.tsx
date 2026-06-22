import { ImageSource } from 'assets/index';
import { Image, ImageProps } from 'expo-image';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ImageSourcePropType, Pressable } from 'react-native';
import { LocalSvg } from 'react-native-svg/css';

interface IProps extends Omit<ImageProps, 'source'> {
  svgMode?: boolean;
  source?: ImageSourcePropType | string;
  fallBackSource?: ImageSourcePropType | string;
  onPress?: () => void;
}

export const RenderImage = memo((props: IProps) => {
  const { svgMode, source, fallBackSource, onPress, ...rest } = props;
  const [isError, setIsError] = useState(false);
  const changeErrTrue = useCallback(() => {
    if (!isError) setIsError(true);
  }, [isError]);

  useEffect(() => {
    if (typeof source === 'string') {
      setIsError(false);
    }
  }, [source]);

  const renderSource = useMemo(() => {
    const fallback = fallBackSource !== undefined ? fallBackSource : ImageSource.img_fallback;

    if (isError || !source) {
      return fallback;
    }

    if (typeof source === 'string') {
      return source;
    }

    return source;
  }, [source, isError, fallBackSource]);

  if (svgMode) {
    // @ts-ignore
    let width = rest.style?.width; let height = rest.style?.height; const aspectRatio = rest.style?.aspectRatio
    if (aspectRatio) {
      width = width ? width : height * aspectRatio
      height = height ? height : width / aspectRatio
    }
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <LocalSvg
          asset={source as ImageSourcePropType}
          width={width}
          height={height}
        />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Image
        {...rest}
        source={renderSource}
        onError={changeErrTrue}
      />
    </Pressable>
  );
})
