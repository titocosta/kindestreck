import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppContext } from '@/utils/AppContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { darkMode } = useAppContext();
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor, darkMode }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
