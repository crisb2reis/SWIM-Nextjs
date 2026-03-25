export type OrganizationTipo = 'PROVEDOR' | 'CONSUMIDOR' | 'PARCEIRO' | 'OUTRO';
export type OrganizationStatus = 'ATIVO' | 'INATIVO' | 'EM_APROVACAO';

export interface Organization {
  id: number;
  name: string;
  acronym?: string | null;
  description?: string | null;
  logo_url?: string | null;
  tipo?: OrganizationTipo | null;
  status?: OrganizationStatus | null;
}

export interface OrganizationFormValues {
  name: string;
  acronym: string;
  description: string;
  tipo: OrganizationTipo | '';
  status: OrganizationStatus | '';
  logo: File | null;
}
