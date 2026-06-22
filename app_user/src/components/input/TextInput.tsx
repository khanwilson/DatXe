import React, { useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { ITheme, useAppTheme } from 'theme/index';

interface IAppTextInput extends TextInputProps {
}

export const AppTextInput = React.memo((props: IAppTextInput) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { style, placeholderTextColor, ...rest } = props;

  return (
    <TextInput
      allowFontScaling={false}
      {...rest}
      style={[styles.defaultStyle, style]}
      placeholderTextColor={placeholderTextColor || theme.color.neutral[400]}
    />
  );
});

const createStyles = (theme: ITheme) => StyleSheet.create({
  defaultStyle: {
    fontSize: theme.fontSize.p16,
    color: theme.color.textColor.primary,
    backgroundColor: theme.color.bg.white,
    borderRadius: theme.dimensions.p12,
    paddingHorizontal: theme.dimensions.p16,
    paddingVertical: theme.dimensions.p12,
    borderWidth: 1,
    borderColor: theme.color.neutral[600],
  },
});

