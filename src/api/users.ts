import { apiClient } from './client';
import { FullUser, PaginatedResponse, Role } from '../types';

export function fetchUsers(page = 1): Promise<PaginatedResponse<FullUser>> {
  return apiClient
    .get<PaginatedResponse<FullUser>>('/users', { params: { page } })
    .then((r) => r.data);
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: Role;
  search_quota?: number;
}

export function createUser(payload: CreateUserPayload): Promise<FullUser> {
  return apiClient.post<FullUser>('/users', payload).then((r) => r.data);
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  search_quota?: number;
  reset_searches?: boolean;
}

export function updateUser(id: number, payload: UpdateUserPayload): Promise<FullUser> {
  return apiClient.put<FullUser>(`/users/${id}`, payload).then((r) => r.data);
}

export function deleteUser(id: number): Promise<void> {
  return apiClient.delete(`/users/${id}`).then(() => undefined);
}

export function lockUser(id: number): Promise<void> {
  return apiClient.post(`/users/${id}/lock`).then(() => undefined);
}

export function unlockUser(id: number): Promise<void> {
  return apiClient.post(`/users/${id}/unlock`).then(() => undefined);
}

export function changeUserPassword(
  id: number,
  password: string,
  password_confirmation: string
): Promise<void> {
  return apiClient
    .put(`/users/${id}/password`, { password, password_confirmation })
    .then(() => undefined);
}
