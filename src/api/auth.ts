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
