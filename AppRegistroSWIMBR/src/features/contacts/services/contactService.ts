/**
 * src/features/contacts/services/contactService.ts
 */

import api from '@/lib/axios';
import { AxiosError } from 'axios';
import type { ContactPoint, ContactPointCreate, ContactPointUpdate } from '../types/contact.types';

const ENDPOINT = '/api/v1/contact-points';

function extractErrorMessage(error: unknown): string {
  if (!error) return '';
  
  const axiosErr = error as AxiosError<Record<string, any>>;
  const data = axiosErr.response?.data;
  if (data && typeof data === 'object') {
    if (typeof data['detail'] === 'string') return data['detail'];
    if (Array.isArray(data['detail'])) {
        return data['detail'][0].msg || JSON.stringify(data['detail']);
    }
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (typeof first === 'string') return first;
  }
  return axiosErr.message || 'Erro desconhecido';
}

export const contactService = {
  async list(): Promise<ContactPoint[]> {
    const { data } = await api.get<ContactPoint[]>(`${ENDPOINT}/`);
    return data;
  },

  async getById(id: number): Promise<ContactPoint> {
    const { data } = await api.get<ContactPoint>(`${ENDPOINT}/${id}`);
    return data;
  },

  async create(values: ContactPointCreate): Promise<ContactPoint> {
    const { data } = await api.post<ContactPoint>(`${ENDPOINT}/`, values);
    return data;
  },

  async update(id: number, values: ContactPointUpdate): Promise<ContactPoint> {
    const { data } = await api.put<ContactPoint>(`${ENDPOINT}/${id}`, values);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};

export { extractErrorMessage };
