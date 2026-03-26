/**
 * src/features/contacts/types/contact.types.ts
 */

export interface ContactPoint {
  id: number;
  name: string;
  email: string;
  role: string | null;
  phone: string | null;
  organization_id: number;
  organization_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContactPointCreate {
  name: string;
  email: string;
  role?: string;
  phone?: string;
  organization_id: number;
}

export interface ContactPointUpdate {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  organization_id?: number;
}
