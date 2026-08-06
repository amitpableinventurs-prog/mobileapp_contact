import { apiClient } from './client';
import { ContactNote } from '../types';

export function addNote(contactId: number, noteHtml: string): Promise<ContactNote> {
  return apiClient
    .post<ContactNote>(`/contacts/${contactId}/notes`, { note_html: noteHtml })
    .then((r) => r.data);
}

export function updateNote(
  contactId: number,
  noteId: number,
  noteHtml: string
): Promise<ContactNote> {
  return apiClient
    .put<ContactNote>(`/contacts/${contactId}/notes/${noteId}`, { note_html: noteHtml })
    .then((r) => r.data);
}

export function deleteNote(contactId: number, noteId: number): Promise<void> {
  return apiClient.delete(`/contacts/${contactId}/notes/${noteId}`).then(() => undefined);
}
