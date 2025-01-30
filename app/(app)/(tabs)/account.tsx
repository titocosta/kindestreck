import React from "react";
import * as Application from 'expo-application';
import { StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '@/utils/AppContext';
import { ExternalLink } from '@/components/ExternalLink';
// import { showPaywall } from "@/utils/paywall";
import ListItemLink from "@/components/ListItemLink";
import DarkModeModal from "@/components/DarkModeModal";

export default function AccountTab() {
  const { isLoggingIn, user, isSubscribed, logout } = useAppContext();

  // To get the app version
  const appVersion = Application.nativeApplicationVersion;

  // To get the build number (iOS) or version code (Android)
  const buildNumber = Application.nativeBuildVersion;

  console.debug(`[AccountTab] account page for user`, user);
  // const displayName = user.isAnonymous ? "guest" : user.providerData?.displayName || user.providerData?.fullName || user.displayName || user.email.split('@')[0];
  const displayName = user?.givenName || user?.email?.split('@')[0] || "guest";

  return (
    <ThemedView style={{ flex: 1}}>
      <ThemedView style={styles.titleContainer}>
        {isLoggingIn && <ThemedText>Loading...</ThemedText>}
        {user && <ThemedText type="title">Hello, {displayName}!</ThemedText>}
      </ThemedView>

      <ExternalLink href="mailto:support@streckenheld.com" style={{ marginBottom: 30 }}>
        <ThemedText type="link">Contact us at support@streckenheld.com</ThemedText>
      </ExternalLink>

      {/*
      {isSubscribed ? 
        <ListItemLink title="OpenIndex Pro" subtitle="You are subscribed to OpenIndex Pro. Thank you!" />
      :
        <ListItemLink title="OpenIndex Pro" subtitle="Upgrade for unlimited uploads and AI chats." onPress={() => showPaywall('openindex-account')} />
      }
      */}

      <DarkModeModal />

      {user?.isAnonymous ? 
        <ListItemLink title="Login or Signup" subtitle="Upload and analyze your documents and screenshots with AI" onPress={logout} />
      :
        <ListItemLink title="Logout" onPress={logout} secondary />
      }

      <ThemedText style={{ marginTop: 30, marginBottom: 20 }} type="subtitle">Danger zone</ThemedText>
      {/* @ts-ignore */}
      <ListItemLink title="Delete account" href="/delete" secondary />

      <ThemedText style={{ marginTop: 30 }} lighter type="small">App version {appVersion} build {buildNumber}</ThemedText>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

