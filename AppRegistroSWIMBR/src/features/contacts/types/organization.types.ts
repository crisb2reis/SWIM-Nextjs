export interface Organization {
  id: number;
  name: string;
  acronym?: string | null;
  description?: string | null;
  logo_url?: string | null;
}

export interface OrganizationFormValues {
  name: string;
  acronym?: string;
  description?: string;
  logo?: File | null;
}
