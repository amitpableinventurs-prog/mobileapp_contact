import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { forgotPin, resetPin } from '../api/pin';
import { getErrorMessage } from '../api/client';

export default function ForgotPinScreen() {
  const { user, applyPinReset } = useAuth();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [code, setCode] = useState('');
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const { message } = await forgotPin();
      setInfo(message);
      setStep('reset');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleReset = async () => {
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (pin.length !== 6 || pin !== confirmPin) {
      setError('Enter and confirm a matching 6-digit PIN.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await resetPin(code, pin);
      applyPinReset(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
      <View style={styles.container}>
        {step === 'request' ? (
          <>
            <Text variant="headlineSmall" style={styles.title}>
              Forgot your PIN?
            </Text>
            <Text style={styles.subtitle}>
              We'll email a 6-digit code to {user?.email ?? 'your account email'} to reset it.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button mode="contained" onPress={handleSendCode} loading={sending} disabled={sending} style={styles.button}>
              Send code
            </Button>
          </>
        ) : (
          <>
            <Text variant="headlineSmall" style={styles.title}>
              Enter the code
            </Text>
            {info ? <Text style={styles.subtitle}>{info}</Text> : null}

            <TextInput
              mode="outlined"
              label="6-digit code"
              value={code}
              onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="New PIN"
              value={pin}
              onChangeText={(v) => setPinValue(v.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Confirm new PIN"
              value={confirmPin}
              onChangeText={(v) => setConfirmPin(v.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button mode="contained" onPress={handleReset} loading={saving} disabled={saving} style={styles.button}>
              Reset PIN
            </Button>
            <Button onPress={handleSendCode} disabled={sending} compact style={styles.resendButton}>
              Resend code
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
  title: { fontWeight: '700', marginBottom: 8 },
  subtitle: { opacity: 0.6, marginBottom: 24 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
  resendButton: { alignSelf: 'center', marginTop: 4 },
  error: { color: '#DC2626', marginBottom: 12, textAlign: 'center' },
});
