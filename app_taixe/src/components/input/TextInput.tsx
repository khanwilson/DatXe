import React, { ForwardedRef, forwardRef, useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

interface IAppTextInput extends TextInputProps {
}

export const AppTextInput = forwardRef((props: IAppTextInput, ref: ForwardedRef<TextInput>) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { style, placeholderTextColor, ...rest } = props;

  return (
    <TextInput
      ref={ref}
      allowFontScaling={false}
      {...rest}
      style={[styles.defaultStyle, style]}
      placeholderTextColor={placeholderTextColor || theme.color.input.placeholder}
    />
  );
});

const createStyles = (theme: ITheme) => StyleSheet.create({
  defaultStyle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.text.primary,
    backgroundColor: theme.color.background.surface,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.input.border,
  },
});

