import { useAppTheme } from '@/contexts/ThemeContext';

export const useDynamicStyles = () => {
  const { getFontSizeMultiplier } = useAppTheme();
  
  const scaleSize = (baseSize: number) => {
    return Math.round(baseSize * getFontSizeMultiplier());
  };
  
  const dynamicStyles = {
    // Text styles
    title: {
      fontSize: scaleSize(28),
      fontWeight: 'bold' as const,
    },
    subtitle: {
      fontSize: scaleSize(20),
      fontWeight: '600' as const,
    },
    body: {
      fontSize: scaleSize(16),
    },
    small: {
      fontSize: scaleSize(14),
    },
    caption: {
      fontSize: scaleSize(12),
    },
    
    // Component styles
    button: {
      fontSize: scaleSize(16),
      paddingVertical: scaleSize(12),
      paddingHorizontal: scaleSize(20),
    },
    input: {
      fontSize: scaleSize(16),
      padding: scaleSize(12),
    },
    
    // Layout styles
    spacing: {
      small: scaleSize(8),
      medium: scaleSize(16),
      large: scaleSize(24),
    },
  };
  
  return { dynamicStyles, scaleSize };
};