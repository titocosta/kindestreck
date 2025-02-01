import React from "react";
import * as Application from 'expo-application';
import { StyleSheet, Platform, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAppContext } from '@/utils/AppContext';
import { ExternalLink } from '@/components/ExternalLink';
// import { showPaywall } from "@/utils/paywall";
import ListItemLink from "@/components/ListItemLink";
import DarkModeModal from "@/components/DarkModeModal";
import { useTranslation } from "react-i18next";
import ParallaxScrollView from "@/components/ParallaxScrollView";

export default function AccountTab() {
  const { isLoggingIn, user, isSubscribed, logout } = useAppContext();
  const { t } = useTranslation();

  // To get the app version
  const appVersion = Application.nativeApplicationVersion;

  // To get the build number (iOS) or version code (Android)
  const buildNumber = Application.nativeBuildVersion;

  console.debug(`[AccountTab] account page for user`, user);
  // const displayName = user.isAnonymous ? "guest" : user.providerData?.displayName || user.providerData?.fullName || user.displayName || user.email.split('@')[0];
  const displayName = user?.givenName || user?.email?.split('@')[0] || "guest";

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        {isLoggingIn && <ThemedText>Loading...</ThemedText>}
        {user && <ThemedText type="title">{t('account.title', { displayName })}</ThemedText>}
        <ExternalLink href="mailto:support@streckenheld.com" style={{ marginBottom: 30 }}>
          <ThemedText type="link">{t('account.contact')}</ThemedText>
        </ExternalLink>
      </ThemedView>

      <DarkModeModal />

      <ListItemLink title={t('account.logout')} onPress={logout} secondary />

      <ThemedText style={{ marginTop: 30, marginBottom: 20, paddingHorizontal: 10 }} type="subtitle">Danger zone</ThemedText>
      {/* @ts-ignore */}
      <ListItemLink title={t('account.delete')} href="/delete" secondary />

      <ThemedText style={{ marginTop: 30, paddingHorizontal: 10 }} lighter type="small">App version {appVersion} build {buildNumber}</ThemedText>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
});
