import axios, { AxiosError } from 'axios';
import * as tokenStorage from './tokenStorage';
import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'laracontact_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function saveToken(token: string) {
  await tokenStorage.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  await tokenStorage.deleteItemAsync(TOKEN_KEY);
}

export async function getToken(): Promise<string | null> {
  return tokenStorage.getItemAsync(TOKEN_KEY);
}

/** Laravel returns {message, errors:{field:[msgs]}} on 422, {message} on 401/403/404/500. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    const data = err.response?.data;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first?.[0]) return first[0];
    }
    if (data?.message) return data.message;
    if (err.message === 'Network Error') {
      return 'Cannot reach the server. Check the API address in src/config.ts and that the backend is running.';
    }
    return err.message;
  }
  return 'Something went wrong.';
}
