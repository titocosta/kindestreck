import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { BASE_URL } from '@/constants/constants';
import { useAppContext } from '@/utils/AppContext';

export default function DeleteAccount() {
  const { idToken, showSnackbar, logout } = useAppContext();
  const [deleting, setDeleting] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);

  const deleteAccount = async () => {
    console.debug(`[DeleteAccount] Deleting account`);
    try {
      setDeleting(true);
      const response = await fetch(`${BASE_URL}/accounts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const json = await response.json();
      if(json.ok) {
        console.debug(`[DeleteAccount] Account deletion request received`, json);
        showSnackbar('Account deletion request received. Please allow 48h to process.');
        setDeleted(true);
        logout();
      } else {
        console.debug(`[DeleteAccount] Error deleting account`, json);
        showSnackbar(`Error deleting account: ${json.error}`);
      }

    } catch (error) {
      console.error(`[DeleteAccount] Error deleting account`, error);
      showSnackbar(`Error deleting account: ${error}`);
    } finally {
      setDeleting(false);
    }
  };

  if(deleted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ marginVertical: 40 }}>We have received your request.</ThemedText>
        <ThemedText lighter>
 Please allow 48h for your account and associated data to be deleted.
        </ThemedText>
      </ThemedView>
    )
  }

  return (
      <ThemedView style={styles.container}>
        <ThemedText>Are you sure you want to delete your Streckenheld account?</ThemedText>
        <ThemedButton style={{ marginVertical: 40 }} secondary title="Delete Account" onPress={deleteAccount} loading={deleting} />
        <ThemedText lighter>This will delete your account and all of your data. This action is irreversible. Please allow 48h for us to fulfill your request.</ThemedText>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 50,
  }
});