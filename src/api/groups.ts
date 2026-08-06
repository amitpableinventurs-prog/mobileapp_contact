import { apiClient } from './client';
import { Group } from '../types';

export function fetchGroups(): Promise<Group[]> {
  return apiClient.get<Group[]>('/groups').then((r) => r.data);
}

export function createGroup(name: string, color?: string): Promise<Group> {
  return apiClient.post<Group>('/groups', { name, color }).then((r) => r.data);
}

export function updateGroup(id: number, name: string, color?: string): Promise<Group> {
  return apiClient.put<Group>(`/groups/${id}`, { name, color }).then((r) => r.data);
}

export function deleteGroup(id: number): Promise<void> {
  return apiClient.delete(`/groups/${id}`).then(() => undefined);
}
