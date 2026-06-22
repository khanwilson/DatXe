import React, { ReactNode } from 'react'
import { StyleSheet, Text, TextProps } from 'react-native'

interface IAppText extends TextProps {
  children: string | ReactNode,
}

export const AppText = React.memo((props: IAppText) => {
  const { children, ...rest } = props

  return <Text allowFontScaling={false} {...rest} style={[styles.defaultStyle, props.style]}>{children}</Text>
})

const styles = StyleSheet.create({
  defaultStyle: {
    fontSize: 14,
    color: 'black',
    fontWeight: 400,
  }
})
