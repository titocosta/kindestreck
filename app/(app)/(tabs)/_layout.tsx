import React from 'react';
import { View } from 'react-native';
import { TabBarIcon } from '@/components/TabBarIcon';
import { Tabs, Redirect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppContext } from '@/utils/AppContext';

export default function TabLayout() {
  const [onboarded, setOnboarded] = React.useState(false);
  const [isCheckingOnboarded, setCheckingOnboarded] = React.useState(true);
  const { user, isLoggingIn, localLoad, darkMode } = useAppContext();
  const colorScheme = useColorScheme(darkMode);

  React.useEffect(() => {
    const checkOnboarded = async () => {
      // Check if user has completed onboarding
      const _onboarded = await localLoad('onboarded');
      console.debug(`[TabLayout] Onboarded: ${_onboarded}`);
      setOnboarded(_onboarded);
      setCheckingOnboarded(false);
    }
    setCheckingOnboarded(true);
    checkOnboarded();
  }, []);

  console.log(`[TabLayout] isLoggingIn: ${isLoggingIn}, isCheckingOnboarded: ${isCheckingOnboarded}, onboarded: ${onboarded}, user:`, user);
  if(isLoggingIn || isCheckingOnboarded) return <View />;
  if(!onboarded) return <Redirect href="/onboarding" />;
  if(!user) return <Redirect href="/login" />;



  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarActiveBackgroundColor: Colors[colorScheme ?? 'light'].background,
        tabBarInactiveBackgroundColor: Colors[colorScheme ?? 'light'].background,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbox' : 'chatbox-outline'} color={color} />
          ),  
        }}
      />
      <Tabs.Screen
        name='account'
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
