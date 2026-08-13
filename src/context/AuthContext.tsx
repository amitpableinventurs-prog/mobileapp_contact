import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as authApi from '../api/auth';
import * as pinApi from '../api/pin';
import { clearToken, getToken, saveToken, setUnauthorizedHandler } from '../api/client';
import { User } from '../types';

const IDLE_LOCK_MS = 5 * 60 * 1000;

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
  applyPinReset: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinRequired, setPinRequired] = useState(false);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      backgroundedAt.current = null;
      setPinRequired(false);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

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
        setPinRequired(me.has_pin);
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If a PIN is set, re-lock the app after it's been backgrounded for 5+ minutes.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundedAt.current = Date.now();
        return;
      }
      if (nextState === 'active') {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since && user?.has_pin && Date.now() - since >= IDLE_LOCK_MS) {
          setPinRequired(true);
        }
      }
    });
    return () => subscription.remove();
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authApi.login(email, password);
    await saveToken(token);
    setUser(loggedInUser);
    setPinRequired(loggedInUser.has_pin);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Token may already be invalid server-side — clear locally regardless.
    }
    await clearToken();
    setPinRequired(false);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.fetchCurrentUser();
    setUser(me);
  }, []);

  const unlockWithPin = useCallback(async (pin: string) => {
    const ok = await pinApi.verifyPin(pin);
    if (ok) setPinRequired(false);
    return ok;
  }, []);

  const setPin = useCallback(async (pin: string) => {
    const updated = await pinApi.setPin(pin);
    setUser(updated);
  }, []);

  const removePin = useCallback(async () => {
    const updated = await pinApi.removePin();
    setUser(updated);
  }, []);

  const applyPinReset = useCallback((updated: User) => {
    setUser(updated);
    setPinRequired(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      pinRequired,
      hasPin: !!user?.has_pin,
      signIn,
      signOut,
      refreshUser,
      unlockWithPin,
      setPin,
      removePin,
      applyPinReset,
    }),
    [user, loading, pinRequired, signIn, signOut, refreshUser, unlockWithPin, setPin, removePin, applyPinReset]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
