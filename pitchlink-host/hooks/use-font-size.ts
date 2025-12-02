import { useAppTheme } from '@/contexts/ThemeContext';

export const useFontSize = () => {
  const { getFontSizeMultiplier } = useAppTheme();
  
  const scaleFontSize = (baseSize: number) => {
    return Math.round(baseSize * getFontSizeMultiplier());
  };
  
  return { scaleFontSize };
};