export type Role = 'super_admin' | 'admin' | 'manager' | 'clerk';

export interface Permissions {
  is_super_admin: boolean;
  is_admin: boolean;
  is_manager: boolean;
  is_clerk: boolean;
  contacts_create: boolean;
  contacts_update: boolean;
  contacts_delete: boolean;
  contacts_manage: boolean;
  contacts_reactivate: boolean;
  approve_contacts: boolean;
  approve_edits: boolean;
  manage_groups: boolean;
  manage_tags: boolean;
  view_tags: boolean;
  manage_users: boolean;
  advanced_search: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  has_pin: boolean;
  current_team_id: number | null;
  team_name: string | null;
  permissions: Permissions;
}

export interface FullUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  is_locked?: boolean;
  locked_at: string | null;
  search_quota: number;
  searches_used: number;
  current_team_id: number | null;
  created_at: string;
}

export interface Group {
  id: number;
  team_id: number;
  name: string;
  color: string | null;
  contacts_count?: number;
}

export interface Tag {
  id: number;
  team_id: number;
  name: string;
  slug: string;
  contacts_count?: number;
}

export interface ContactNote {
  id: number;
  team_id: number;
  contact_id: number;
  user_id: number;
  note_html: string;
  created_at: string;
  updated_at: string;
  author?: { id: number; name: string; email: string };
}

export interface ContactCall {
  id: number;
  contact_id: number;
  user_id: number | null;
  status: string;
  to_number: string;
  sent_at: string;
  user?: { id: number; name: string; email: string } | null;
}

export interface ContactEditRequest {
  id: number;
  contact_id: number;
  team_id: number;
  requested_by: number;
  reviewed_by: number | null;
  status: 'pending' | 'approved' | 'rejected';
  changes: Record<string, unknown>;
  original: Record<string, unknown>;
  tags: number[] | null;
  created_at: string;
  contact?: Contact;
  requestedBy?: { id: number; name: string; email: string };
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | null;
export type ContactStatus = 'active' | 'suspended' | 'banned' | null;

export interface Contact {
  id: number;
  team_id: number;
  group_id: number | null;
  owner_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  area: string | null;
  photo: string | null;
  birthday: string | null;
  gender: string | null;
  lifecycle_stage: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  notes: string | null;
  admin_comment: string | null;
  rating: string | null;
  status: ContactStatus;
  approval_status: ApprovalStatus;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  group?: Group | null;
  tags?: Tag[];
  owner?: { id: number; name: string; email: string } | null;
  contactNotes?: ContactNote[];
  editRequests?: ContactEditRequest[];
  calls?: ContactCall[];
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface DashboardData {
  total_contacts: number;
  searches_used: number;
  search_quota: number;
  pending_contacts_count?: number;
  pending_edits_count?: number;
  my_pending_contacts_count?: number;
}

export interface PendingQueue {
  contacts: PaginatedResponse<Contact>;
  edit_requests: PaginatedResponse<ContactEditRequest>;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  website: string;
  address: string;
  birthday: string;
  lifecycle_stage: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  notes: string;
  group_id: number | null;
  tags: number[];
  photo: PickedPhoto | null;
}

export interface PickedPhoto {
  uri: string;
  name: string;
  type: string;
}
