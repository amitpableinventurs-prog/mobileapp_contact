import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store's web build is a stub (`export default {}`) with no real
// implementation, so calling it on web throws "is not a function". Fall back
// to localStorage there; native platforms keep using real secure storage.
const isWeb = Platform.OS === 'web';

export async function getItemAsync(key: string): Promise<string | null> {
  if (isWeb) return window.localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (isWeb) {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
