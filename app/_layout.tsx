import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Slot, usePathname, useGlobalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import AppContextProvider from '@/utils/AppContext';
import { KindeAuthProvider } from '@kinde/expo';


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // LibreBaskerville: require('../assets/fonts/LibreBaskerville-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
      <KindeAuthProvider config={{
        domain: process.env.EXPO_PUBLIC_KINDE_ISSUER_URL,
        clientId: process.env.EXPO_PUBLIC_KINDE_CLIENT_ID,
        // Optional (default: "openid profile email offline")
        // scopes: "openid profile email offline",
      }}>
        <AppContextProvider>
          <SafeAreaProvider>
            <Slot />
          </SafeAreaProvider>
        </AppContextProvider>
      </KindeAuthProvider>
    </ThemeProvider>
  );
}
