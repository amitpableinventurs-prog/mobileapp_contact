import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function SetPinScreen() {
  const { setPin: savePin } = useAuth();
  const navigation = useNavigation();
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPinValue] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFirstChange = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 6);
    setPinValue(digits);
    setError(null);
    if (digits.length === 6) setStep('confirm');
  };

  const handleConfirmChange = async (value: string) => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 6);
    setConfirmPin(digits);
    setError(null);
    if (digits.length !== 6) return;

    if (digits !== pin) {
      setError('PINs did not match. Try again.');
      setPinValue('');
      setConfirmPin('');
      setStep('enter');
      return;
    }

    setSaving(true);
    await savePin(digits);
    setSaving(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'android' ? 'height' : 'padding'}>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          {step === 'enter' ? 'Set a 6-digit PIN' : 'Confirm your PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'enter'
            ? "You'll use this PIN to unlock the app instead of signing in every time."
            : 'Enter the same PIN again to confirm.'}
        </Text>

        <TextInput
          key={step}
          mode="outlined"
          value={step === 'enter' ? pin : confirmPin}
          onChangeText={step === 'enter' ? handleFirstChange : handleConfirmChange}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoFocus
          style={styles.input}
          disabled={saving}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title: { fontWeight: '700', marginBottom: 8 },
  subtitle: { opacity: 0.6, marginBottom: 24 },
  input: { marginBottom: 12, textAlign: 'center' },
  error: { color: '#DC2626', marginBottom: 8 },
});
