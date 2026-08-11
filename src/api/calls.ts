import { apiClient } from './client';
import { ContactCall } from '../types';

export function logCall(contactId: number): Promise<ContactCall> {
  return apiClient.post<ContactCall>(`/contacts/${contactId}/log-call`).then((r) => r.data);
}
