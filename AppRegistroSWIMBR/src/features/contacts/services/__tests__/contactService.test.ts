import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactService, extractErrorMessage } from '../contactService';
import type { ContactPoint, ContactPointCreate, ContactPointUpdate } from '@/features/contacts/types/contact.types';
import { AxiosError } from 'axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/lib/axios';

const mockApi = vi.mocked(api);

describe('contactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('deve listar todos os contact points', async () => {
      const mockContacts: ContactPoint[] = [
        { id: 1, name: 'John', email: 'john@test.com', role: 'Admin', phone: '+551199999', organization_id: 1, organization_name: 'Org 1' },
        { id: 2, name: 'Jane', email: 'jane@test.com', role: 'User', phone: '+551188888', organization_id: 1, organization_name: 'Org 1' },
      ];

      mockApi.get.mockResolvedValue({ data: mockContacts });

      const result = await contactService.list();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/contact-points/');
      expect(result).toEqual(mockContacts);
    });

    it('deve retornar array vazio se não houver contact points', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await contactService.list();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('deve buscar contact point por id', async () => {
      const mockContact: ContactPoint = { id: 1, name: 'John', email: 'john@test.com', role: 'Admin', phone: '+551199999', organization_id: 1 };

      mockApi.get.mockResolvedValue({ data: mockContact });

      const result = await contactService.getById(1);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/contact-points/1');
      expect(result).toEqual(mockContact);
    });
  });

  describe('create', () => {
    it('deve criar novo contact point', async () => {
      const contactData: ContactPointCreate = {
        name: 'New Contact',
        email: 'new@test.com',
        role: 'Manager',
        phone: '+551177777',
        organization_id: 1,
      };

      const mockResponse: ContactPoint = { 
        id: 3, 
        name: 'New Contact', 
        email: 'new@test.com', 
        role: 'Manager', 
        phone: '+551177777', 
        organization_id: 1, 
        organization_name: 'Org 1' 
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await contactService.create(contactData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/contact-points/', contactData);
      expect(result).toEqual(mockResponse);
    });

    it('deve criar contact point sem phone opcional', async () => {
      const contactData: ContactPointCreate = {
        name: 'Minimal Contact',
        email: 'minimal@test.com',
        role: undefined,
        phone: undefined,
        organization_id: 1,
      };

      mockApi.post.mockResolvedValue({ data: { id: 4, ...contactData, role: null, phone: null } as ContactPoint });

      const result = await contactService.create(contactData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/contact-points/', contactData);
      expect(result.name).toBe('Minimal Contact');
    });
  });

  describe('update', () => {
    it('deve atualizar contact point', async () => {
      const updateData: ContactPointUpdate = {
        name: 'Updated Name',
        phone: '+551166666',
      };

      const mockResponse: ContactPoint = { 
        id: 1, 
        name: 'Updated Name', 
        email: 'john@test.com', 
        role: null, 
        phone: '+551166666', 
        organization_id: 1 
      };

      mockApi.put.mockResolvedValue({ data: mockResponse });

      const result = await contactService.update(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/contact-points/1', updateData);
      expect(result.name).toBe('Updated Name');
    });

    it('deve permitir atualização parcial', async () => {
      const updateData: ContactPointUpdate = { email: 'newemail@test.com' };

      mockApi.put.mockResolvedValue({ data: {} as ContactPoint });

      await contactService.update(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/contact-points/1', { email: 'newemail@test.com' });
    });
  });

  describe('remove', () => {
    it('deve deletar contact point', async () => {
      mockApi.delete.mockResolvedValue({});

      await contactService.remove(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/contact-points/1');
    });

    it('deve resolver sem retorno', async () => {
      mockApi.delete.mockResolvedValue({});

      await expect(contactService.remove(1)).resolves.toBeUndefined();
    });
  });
});

describe('extractErrorMessage', () => {
  it('deve retornar string vazia para erro undefined', () => {
    expect(extractErrorMessage(undefined)).toBe('');
  });

  it('deve retornar string vazia para erro null', () => {
    expect(extractErrorMessage(null)).toBe('');
  });

  it('deve extrair mensagem de detail string', () => {
    const error = new AxiosError('Request failed') as any;
    error.response = { data: { detail: 'Erro específico' } };

    expect(extractErrorMessage(error)).toBe('Erro específico');
  });

  it('deve extrair mensagem de array detail', () => {
    const error = new AxiosError('Request failed') as any;
    error.response = { data: { detail: [{ msg: 'Erro de validação', type: 'value_error' }] } };

    expect(extractErrorMessage(error)).toBe('Erro de validação');
  });

  it('deve usar mensagem do Axios como fallback', () => {
    const error = new AxiosError('Network Error');

    expect(extractErrorMessage(error)).toBe('Network Error');
  });
});