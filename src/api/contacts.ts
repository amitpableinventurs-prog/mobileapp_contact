import { apiClient } from './client';
import { Contact, ContactFormValues, PaginatedResponse } from '../types';

export interface ContactsQuery {
  q?: string;
  number?: string;
  group_id?: number;
  tags?: number[];
  page?: number;
  per_page?: number;
}

export function fetchContacts(query: ContactsQuery): Promise<PaginatedResponse<Contact>> {
  return apiClient
    .get<PaginatedResponse<Contact>>('/contacts', { params: query })
    .then((r) => r.data);
}

export function fetchContact(id: number): Promise<Contact> {
  return apiClient.get<Contact>(`/contacts/${id}`).then((r) => r.data);
}

function toFormData(values: Partial<ContactFormValues>): FormData {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === 'tags' && Array.isArray(value)) {
      value.forEach((tagId) => form.append('tags[]', String(tagId)));
      return;
    }
    if (key === 'group_id') {
      form.append('group_id', String(value));
      return;
    }
    if (key === 'photo' && typeof value === 'object') {
      // React Native's FormData accepts a {uri, name, type} file descriptor here.
      form.append('photo', value as unknown as Blob);
      return;
    }
    form.append(key, String(value));
  });
  return form;
}

export function createContact(values: Partial<ContactFormValues>): Promise<Contact> {
  return apiClient
    .post<Contact>('/contacts', toFormData(values), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
}

export interface UpdateContactResult {
  queued: boolean;
  message: string;
  contact?: Contact;
}

export function updateContact(
  id: number,
  values: Partial<ContactFormValues>
): Promise<UpdateContactResult> {
  const form = toFormData(values);
  form.append('_method', 'PUT');
  return apiClient
    .post(`/contacts/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => {
      const body = r.data as { contact?: Contact; message?: string; edit_request?: unknown };
      if (body.edit_request) {
        return { queued: true, message: body.message ?? 'Submitted for approval.' };
      }
      if (body.contact) {
        return { queued: false, message: body.message ?? 'Contact updated.', contact: body.contact };
      }
      return { queued: false, message: body.message ?? 'No changes to submit.' };
    });
}

export function deleteContact(id: number): Promise<void> {
  return apiClient.delete(`/contacts/${id}`).then(() => undefined);
}

export function suspendContact(id: number): Promise<void> {
  return apiClient.post(`/contacts/${id}/suspend`).then(() => undefined);
}

export function banContact(id: number): Promise<void> {
  return apiClient.post(`/contacts/${id}/ban`).then(() => undefined);
}

export function reactivateContact(id: number): Promise<void> {
  return apiClient.post(`/contacts/${id}/reactivate`).then(() => undefined);
}

export function rateContact(id: number, rating: number): Promise<void> {
  return apiClient.post(`/contacts/${id}/rate`, { rating }).then(() => undefined);
}
