import api from '@/lib/axios';
import { Organization, OrganizationFormValues } from '../types/organization.types';

const ENDPOINT = '/api/v1/organizations';

function toFormData(values: OrganizationFormValues): FormData {
  const fd = new FormData();
  fd.append('name', values.name);
  if (values.acronym) fd.append('acronym', values.acronym);
  if (values.description) fd.append('description', values.description);
  if (values.tipo) fd.append('tipo', values.tipo);
  if (values.status) fd.append('status', values.status);
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

export class ApiError extends Error {
  public fieldErrors?: Array<{ field: string; message: string }>;
  constructor(message: string, fieldErrors?: Array<{ field: string; message: string }>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export function parseOrganizationError(err: unknown): ApiError {
  if (err instanceof Error) {
    const detail = (err as any)?.response?.data?.detail;
    
    // Formato de erro de validação do FastAPI (array de objetos loc/msg)
    if (Array.isArray(detail)) {
      const fieldErrors = detail.map((e: any) => {
        // e.loc = ["body", "name"]
        const fieldName = e.loc?.length > 1 ? e.loc[e.loc.length - 1] : 'unknown';
        return { field: fieldName, message: e.msg };
      });
      return new ApiError('Erro de validação. Verifique os campos.', fieldErrors);
    }

    // Erro string simples
    if (typeof detail === 'string') {
      return new ApiError(detail);
    }
    
    return new ApiError(err.message);
  }
  return new ApiError('Erro desconhecido');
}
