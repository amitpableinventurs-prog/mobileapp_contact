import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { RootNavigationProp } from '../navigation/types';
import { branding } from '../branding';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation<RootNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={branding.logo} style={styles.logo} resizeMode="contain" />
          <Text variant="headlineMedium" style={styles.title}>
            {branding.appName}
          </Text>
          <Text style={styles.subtitle}>{branding.tagline}</Text>
        </View>

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          autoCapitalize="none"
          style={styles.input}
          right={
            <TextInput.Icon
              icon={secure ? 'eye' : 'eye-off'}
              onPress={() => setSecure((s) => !s)}
            />
          }
          onSubmitEditing={handleSubmit}
        />

        <Button
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotButton}
          compact
        >
          Forgot password?
        </Button>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign in
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 16,
  },
  forgotButton: { alignSelf: 'flex-end', marginTop: -4 },
  title: { fontWeight: '700' },
  subtitle: { opacity: 0.6, marginTop: 4 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  error: { color: '#DC2626', marginBottom: 8, textAlign: 'center' },
});
