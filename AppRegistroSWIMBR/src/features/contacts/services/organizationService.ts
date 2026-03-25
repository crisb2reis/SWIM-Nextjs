import api from '@/lib/axios';
import { Organization } from '../types/organization.types';

const ENDPOINT = '/api/v1/organizations';

export const organizationService = {
  async list(): Promise<Organization[]> {
    const { data } = await api.get<Organization[]>(`${ENDPOINT}/`);
    return data;
  },
};
