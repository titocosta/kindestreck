/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string, darkMode?: 'system' | 'light' | 'dark' },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  negative: boolean = false,
) {
  let theme = useColorScheme(props.darkMode) ?? 'light';
  if(negative) theme = theme === 'light' ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
