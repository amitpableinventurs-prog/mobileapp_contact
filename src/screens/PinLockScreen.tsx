import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { branding } from '../branding';
import { getErrorMessage } from '../api/client';
import { RootNavigationProp } from '../navigation/types';

export default function PinLockScreen() {
  const { user, unlockWithPin, signOut } = useAuth();
  const navigation = useNavigation<RootNavigationProp>();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleChange = async (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 6);
    setPin(digits);
    setError(null);
    if (digits.length === 6) {
      setChecking(true);
      try {
        const ok = await unlockWithPin(digits);
        if (!ok) {
          setError('Wrong PIN. Try again.');
          setPin('');
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setChecking(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Image source={branding.logo} style={styles.logo} resizeMode="contain" />
          <Text variant="headlineMedium" style={styles.title}>
            Enter PIN
          </Text>
          {user ? <Text style={styles.subtitle}>{user.name}</Text> : null}
        </View>

        <TextInput
          mode="outlined"
          value={pin}
          onChangeText={handleChange}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoFocus
          style={styles.input}
          disabled={checking}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button onPress={() => navigation.navigate('ForgotPin')} compact style={styles.signOutButton}>
          Forgot PIN?
        </Button>
        <Button onPress={() => signOut()} compact textColor="#DC2626">
          Sign out
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 64, height: 64, borderRadius: 16, marginBottom: 16 },
  title: { fontWeight: '700' },
  subtitle: { opacity: 0.6, marginTop: 4 },
  input: { marginBottom: 12, textAlign: 'center' },
  error: { color: '#DC2626', marginBottom: 8, textAlign: 'center' },
  signOutButton: { alignSelf: 'center', marginTop: 8 },
});
