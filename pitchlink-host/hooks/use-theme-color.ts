/**
 * Custom hook to get theme colors based on the app's theme settings
 */

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/contexts/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { isDarkMode } = useAppTheme();
  const theme = isDarkMode ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
