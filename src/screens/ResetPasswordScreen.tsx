import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { resetPassword } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

// The emailed reset link is a full URL (…/reset-password/{token}?email=…).
// Accept either the bare token or the whole pasted link.
function extractToken(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/reset-password\/([^/?\s]+)/);
  return match ? match[1] : trimmed;
}

export default function ResetPasswordScreen({ route, navigation }: Props) {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      resetPassword({
        token: extractToken(token),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirm,
      }),
    onSuccess: () => navigation.navigate('Login'),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const canSubmit =
    email.trim() && token.trim() && password.length >= 8 && password === passwordConfirm;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Set a new password
        </Text>
        <Text style={styles.subtitle}>
          Paste the reset link (or code) from your email, then choose a new password.
        </Text>

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Reset link or code"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Confirm new password"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          style={styles.input}
        />
        {password && password.length < 8 ? (
          <HelperText type="error">Password must be at least 8 characters.</HelperText>
        ) : null}
        {password && passwordConfirm && password !== passwordConfirm ? (
          <HelperText type="error">Passwords do not match.</HelperText>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={!canSubmit || mutation.isPending}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Reset password
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.6, marginBottom: 20 },
  input: { marginBottom: 12 },
  error: { color: '#DC2626', marginBottom: 8, textAlign: 'center' },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
});
