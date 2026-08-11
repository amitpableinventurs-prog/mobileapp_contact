import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { requestPasswordReset } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { RootNavigationProp } from '../navigation/types';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => requestPasswordReset(email.trim()),
    onSuccess: () => setSent(true),
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Reset your password
        </Text>
        <Text style={styles.subtitle}>Enter your account email and we&apos;ll send a reset link.</Text>

        {sent ? (
          <>
            <Text style={styles.success}>
              If an account exists for {email.trim()}, a reset link has been sent.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ResetPassword', { email: email.trim() })}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              I have a reset code
            </Button>
          </>
        ) : (
          <>
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
              onSubmitEditing={() => email.trim() && mutation.mutate()}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              mode="contained"
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!email.trim() || mutation.isPending}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Send reset link
            </Button>
            <Button
              onPress={() => navigation.navigate('ResetPassword', { email: email.trim() })}
              style={styles.linkButton}
            >
              Already have a reset code?
            </Button>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.6, marginBottom: 20 },
  input: { marginBottom: 12 },
  success: { color: '#16A34A', marginBottom: 20 },
  error: { color: '#DC2626', marginBottom: 8, textAlign: 'center' },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  linkButton: { marginTop: 12 },
});
