import axios from 'axios';
import { apiClient } from './client';
import { User } from '../types';

export function setPin(pin: string): Promise<User> {
  return apiClient.post<{ user: User }>('/pin', { pin }).then((r) => r.data.user);
}

/**
 * Resolves false only for an actual wrong-PIN rejection (422 from the server).
 * Network failures, timeouts, and other server errors are rethrown so callers
 * can tell "wrong PIN" apart from "couldn't reach the server".
 */
export function verifyPin(pin: string): Promise<boolean> {
  return apiClient
    .post('/pin/verify', { pin })
    .then(() => true)
    .catch((err) => {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        return false;
      }
      throw err;
    });
}

export function removePin(): Promise<User> {
  return apiClient.delete<{ user: User }>('/pin').then((r) => r.data.user);
}

export function forgotPin(): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/pin/forgot').then((r) => r.data);
}

export function resetPin(code: string, pin: string): Promise<User> {
  return apiClient.post<{ user: User }>('/pin/reset', { code, pin }).then((r) => r.data.user);
}
