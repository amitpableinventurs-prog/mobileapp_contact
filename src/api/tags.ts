import { apiClient } from './client';
import { Tag } from '../types';

export function fetchTags(): Promise<Tag[]> {
  return apiClient.get<Tag[]>('/tags').then((r) => r.data);
}

export function createTag(name: string): Promise<Tag> {
  return apiClient.post<Tag>('/tags', { name }).then((r) => r.data);
}

export function updateTag(id: number, name: string): Promise<Tag> {
  return apiClient.put<Tag>(`/tags/${id}`, { name }).then((r) => r.data);
}

export function deleteTag(id: number): Promise<void> {
  return apiClient.delete(`/tags/${id}`).then(() => undefined);
}
