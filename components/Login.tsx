import React from 'react';
import { StyleSheet, Platform, Image } from 'react-native';
import * as Application from 'expo-application';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '@/utils/AppContext';
import { ThemedProgressCircle } from '@/components/ThemedProgressCircle';
import { ThemedButton } from '@/components/ThemedButton';

export default function Login() {
  const { login, register, user, isLoggingIn } = useAppContext();

  let btns = <>
    <ThemedButton
      title="Sign up"
      onPress={register}
      iconName="person-add"
      iconSize={14}
      loading={isLoggingIn} 
      textStyle={{ fontSize: 14, fontWeight: 'semibold' }}
    />
    <ThemedButton
      title="Sign in"
      onPress={login}
      iconName="person"
      iconSize={14}
      loading={isLoggingIn} 
      textStyle={{ fontSize: 14, fontWeight: 'semibold' }}
    />
    <ThemedText lighter style={styles.subtitle}>Login securely with your email, Apple ID or Google account.</ThemedText>
  </>;

  if (Platform.OS === 'android' || Platform.OS === 'web') {
    btns = <>
      <ThemedButton
        title="Sign up"
        onPress={register}
        iconName="person-add"
        iconSize={14}
        loading={isLoggingIn} 
        textStyle={{ fontSize: 14, fontWeight: 'semibold' }}
      />
      <ThemedButton
        title="Sign in"
        onPress={login}
        iconName="person"
        iconSize={14}
        loading={isLoggingIn} 
        textStyle={{ fontSize: 14, fontWeight: 'semibold' }}
      />
      <ThemedText lighter style={styles.subtitle}>Login securely with your email or Google account.</ThemedText>
    </>
  }

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('../assets/images/streckenheld-icon-1080x1080.png')}
        style={{
          width: 100,
          height: 100,
          marginBottom: 10,
        }}
      />
      <ThemedText style={styles.title}>
        All your orders in one place.{"\n"}
      </ThemedText>
      {isLoggingIn ? <ThemedProgressCircle /> : btns}
      <ThemedText style={{ marginTop: 60 }} lighter type="small">App version {Application.nativeApplicationVersion} build {Application.nativeBuildVersion}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
    gap: 30,
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
});