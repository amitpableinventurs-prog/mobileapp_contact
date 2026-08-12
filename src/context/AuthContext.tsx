import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authApi from '../api/auth';
import { clearToken, getToken, saveToken } from '../api/client';
import * as pinStorage from '../api/pinStorage';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  pinRequired: boolean;
  hasPin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.fetchCurrentUser();
        setUser(me);
        const pinSet = await pinStorage.hasPin();
        setHasPin(pinSet);
        setPinRequired(pinSet);
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authApi.login(email, password);
    await saveToken(token);
    setUser(loggedInUser);
    const pinSet = await pinStorage.hasPin();
    setHasPin(pinSet);
    setPinRequired(pinSet);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Token may already be invalid server-side — clear locally regardless.
    }
    await clearToken();
    await pinStorage.clearPin();
    setHasPin(false);
    setPinRequired(false);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.fetchCurrentUser();
    setUser(me);
  }, []);

  const unlockWithPin = useCallback(async (pin: string) => {
    const ok = await pinStorage.verifyPin(pin);
    if (ok) setPinRequired(false);
    return ok;
  }, []);

  const setPin = useCallback(async (pin: string) => {
    await pinStorage.savePin(pin);
    setHasPin(true);
  }, []);

  const removePin = useCallback(async () => {
    await pinStorage.clearPin();
    setHasPin(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      pinRequired,
      hasPin,
      signIn,
      signOut,
      refreshUser,
      unlockWithPin,
      setPin,
      removePin,
    }),
    [user, loading, pinRequired, hasPin, signIn, signOut, refreshUser, unlockWithPin, setPin, removePin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
