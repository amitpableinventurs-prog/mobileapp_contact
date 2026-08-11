import { apiClient } from './client';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient
    .post<LoginResponse>('/login', { email, password, device_name: 'android-app' })
    .then((r) => r.data);
}

export function logout(): Promise<void> {
  return apiClient.post('/logout').then(() => undefined);
}

export function fetchCurrentUser(): Promise<User> {
  return apiClient.get<User>('/user').then((r) => r.data);
}

export function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/forgot-password', { email }).then((r) => r.data);
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/reset-password', payload).then((r) => r.data);
}
