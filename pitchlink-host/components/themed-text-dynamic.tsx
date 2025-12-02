import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/contexts/ThemeContext';

export type ThemedTextDynamicProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  baseFontSize?: number;
};

export function ThemedTextDynamic({
  style,
  lightColor,
  darkColor,
  type = 'default',
  baseFontSize,
  ...rest
}: ThemedTextDynamicProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { getFontSizeMultiplier } = useAppTheme();
  
  // Get base font size based on type or use provided baseFontSize
  const getBaseFontSize = () => {
    if (baseFontSize) return baseFontSize;
    
    switch (type) {
      case 'title': return 32;
      case 'subtitle': return 20;
      case 'defaultSemiBold': return 16;
      case 'link': return 16;
      default: return 16;
    }
  };
  
  const fontSize = Math.round(getBaseFontSize() * getFontSizeMultiplier());

  return (
    <Text
      style={[
        { color, fontSize },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    lineHeight: 24,
  },
  defaultSemiBold: {
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    color: '#0a7ea4',
  },
});