import { apiClient } from './client';
import { Contact, ContactEditRequest, PendingQueue } from '../types';

export function fetchPendingQueue(params?: { contactsPage?: number; editsPage?: number }): Promise<PendingQueue> {
  return apiClient
    .get<PendingQueue>('/contacts/pending', {
      params: { contacts_page: params?.contactsPage, edits_page: params?.editsPage },
    })
    .then((r) => r.data);
}

export function approveContact(id: number): Promise<Contact> {
  return apiClient.post<Contact>(`/contacts/${id}/approve`).then((r) => r.data);
}

export function rejectContact(id: number): Promise<Contact> {
  return apiClient.post<Contact>(`/contacts/${id}/reject`).then((r) => r.data);
}

export function approveEditRequest(id: number): Promise<{ approved: boolean; contact: Contact }> {
  return apiClient
    .post<{ approved: boolean; contact: Contact }>(`/contact-edit-requests/${id}/approve`)
    .then((r) => r.data);
}

export function rejectEditRequest(id: number): Promise<void> {
  return apiClient.post(`/contact-edit-requests/${id}/reject`).then(() => undefined);
}

export type { ContactEditRequest };
