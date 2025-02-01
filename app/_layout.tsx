import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Slot, usePathname, useGlobalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import AppContextProvider from '@/utils/AppContext';
import i18n, { i18nInitPromise } from '@/utils/i18n';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const [i18nLoaded, setI18nLoaded] = useState(false);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // LibreBaskerville: require('../assets/fonts/LibreBaskerville-Regular.ttf'),
  });

  i18nInitPromise.then(() => {
    setI18nLoaded(true);
  });

  useEffect(() => {
    if (loaded && i18nLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, i18nLoaded]);

  /*
  useEffect(() => {
    // track screen with analytics
    analytics().logScreenView({
      screen_name: pathname,
      screen_class: pathname,
    });
  }, [pathname, params]);
  */

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppContextProvider>
        <SafeAreaProvider>
          <Slot />
        </SafeAreaProvider>
      </AppContextProvider>
    </ThemeProvider>
  );
}
