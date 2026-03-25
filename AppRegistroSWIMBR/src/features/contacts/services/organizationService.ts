import api from '@/lib/axios';
import { Organization, OrganizationFormValues } from '../types/organization.types';

const ENDPOINT = '/api/v1/organizations';

function toFormData(values: OrganizationFormValues): FormData {
  const fd = new FormData();
  fd.append('name', values.name);
  if (values.acronym) fd.append('acronym', values.acronym);
  if (values.description) fd.append('description', values.description);
  if (values.logo) fd.append('logo', values.logo);
  return fd;
}

export const organizationService = {
  async list(search?: string): Promise<Organization[]> {
    const params = search ? { search } : {};
    const { data } = await api.get<Organization[]>(`${ENDPOINT}/`, { params });
    return data;
  },

  async getById(id: number): Promise<Organization> {
    const { data } = await api.get<Organization>(`${ENDPOINT}/${id}`);
    return data;
  },

  async create(values: OrganizationFormValues): Promise<Organization> {
    const { data } = await api.post<Organization>(`${ENDPOINT}/`, toFormData(values), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(id: number, values: Partial<OrganizationFormValues>): Promise<Organization> {
    const { data } = await api.put<Organization>(`${ENDPOINT}/${id}`, toFormData(values as OrganizationFormValues), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};

export function extractOrganizationErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = (err as any)?.response?.data?.detail;
    if (msg) return String(msg);
    return err.message;
  }
  return 'Erro desconhecido';
}
