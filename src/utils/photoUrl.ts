import { API_BASE_URL } from '../config';

const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/** Contact photos are stored as relative paths (e.g. "contacts/31/x.jpg") under Laravel's public disk. */
export function resolvePhotoUrl(photo?: string | null): string | null {
  return photo ? `${SERVER_URL}/storage/${photo}` : null;
}
