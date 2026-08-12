import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Dialog, Portal, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import { API_BASE_URL } from '../config';
import { RootNavigationProp } from '../navigation/types';

export default function ProfileScreen() {
  const { user, signOut, hasPin, removePin } = useAuth();
  const navigation = useNavigation<RootNavigationProp>();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [removePinVisible, setRemovePinVisible] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setConfirmVisible(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={initials || '?'} />
        <Text variant="headlineSmall" style={styles.name}>
          {user.name}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <RoleBadge role={user.role} />
      </View>

      <View style={styles.card}>
        <Row label="Workspace" value={user.team_name ?? '—'} />
        <Row label="Server" value={API_BASE_URL.replace('/api', '')} />
      </View>

      <View style={styles.card}>
        <Button mode="outlined" onPress={() => navigation.navigate('SetPin')} style={styles.pinButton}>
          {hasPin ? 'Change PIN' : 'Set PIN'}
        </Button>
        {hasPin ? (
          <Button textColor="#DC2626" onPress={() => setRemovePinVisible(true)}>
            Remove PIN
          </Button>
        ) : null}
      </View>

      <Button mode="outlined" textColor="#DC2626" onPress={() => setConfirmVisible(true)} style={styles.signOutButton}>
        Sign out
      </Button>

      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Sign out?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
            <Button onPress={handleSignOut} loading={signingOut} textColor="#DC2626">
              Sign out
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={removePinVisible} onDismiss={() => setRemovePinVisible(false)}>
          <Dialog.Title>Remove PIN?</Dialog.Title>
          <Dialog.Content>
            <Text>You'll need to sign in again next time you open the app.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRemovePinVisible(false)}>Cancel</Button>
            <Button
              onPress={async () => {
                await removePin();
                setRemovePinVisible(false);
              }}
              textColor="#DC2626"
            >
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20 },
  header: { alignItems: 'center', gap: 8 },
  name: { fontWeight: '700', marginTop: 8 },
  email: { opacity: 0.6 },
  card: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { opacity: 0.6 },
  rowValue: { fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  pinButton: { borderRadius: 8 },
  signOutButton: { borderRadius: 8, borderColor: '#DC2626' },
});
