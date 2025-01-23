import { useColorScheme as useColorSchemeRN } from 'react-native';

export function useColorScheme(darkMode?: 'system' | 'light' | 'dark') {
  const systemScheme = useColorSchemeRN() ?? 'light';
  return (darkMode == 'light' || darkMode == 'dark') ? darkMode : systemScheme;
}