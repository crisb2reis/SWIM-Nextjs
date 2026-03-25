import api from '@/lib/axios';
import { Service, ServiceFormValues } from '../types/service.types';

const ENDPOINT = '/api/v1/services';

export const serviceService = {
  async list(search?: string): Promise<Service[]> {
    const params = search ? { search } : {};
    const { data } = await api.get<Service[]>(`${ENDPOINT}/`, { params });
    return data;
  },

  async getById(id: number): Promise<Service> {
    const { data } = await api.get<Service>(`${ENDPOINT}/${id}`);
    return data;
  },

  async create(values: ServiceFormValues): Promise<Service> {
    const { data } = await api.post<Service>(`${ENDPOINT}/`, values);
    return data;
  },

  async update(id: number, values: Partial<ServiceFormValues>): Promise<Service> {
    const { data } = await api.put<Service>(`${ENDPOINT}/${id}`, values);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};

export function extractServiceErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = (err as any)?.response?.data?.detail;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg) && msg.length > 0 && msg[0].msg) return msg[0].msg;
    return err.message;
  }
  return 'Erro desconhecido';
}
