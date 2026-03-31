import { describe, it, expect, vi, beforeEach } from 'vitest';
import { organizationService, ApiError, parseOrganizationError } from '../organizationService';
import type { OrganizationFormValues, Organization } from '@/features/organizations/types/organization.types';

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

describe('organizationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('deve listar todas as organizações', async () => {
      const mockOrgs: Organization[] = [
        { id: 1, name: 'Org 1', acronym: 'O1', tipo: 'PROVEDOR', status: 'ATIVO' },
        { id: 2, name: 'Org 2', acronym: 'O2', tipo: 'CONSUMIDOR', status: 'ATIVO' },
      ];

      mockApi.get.mockResolvedValue({ data: mockOrgs });

      const result = await organizationService.list();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/organizations/', { params: {} });
      expect(result).toEqual(mockOrgs);
    });

    it('deve listar com filtro de busca', async () => {
      const mockOrgs: Organization[] = [
        { id: 1, name: 'DECEA', acronym: 'DECEA' },
      ];

      mockApi.get.mockResolvedValue({ data: mockOrgs });

      const result = await organizationService.list('DECEA');

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/organizations/', { params: { search: 'DECEA' } });
      expect(result).toEqual(mockOrgs);
    });

    it('deve retornar array vazio quando não houver organizações', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await organizationService.list();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('deve buscar organização por ID', async () => {
      const mockOrg: Organization = { id: 1, name: 'DECEA', acronym: 'DECEA', tipo: 'PROVEDOR', status: 'ATIVO' };

      mockApi.get.mockResolvedValue({ data: mockOrg });

      const result = await organizationService.getById(1);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/organizations/1');
      expect(result).toEqual(mockOrg);
    });
  });

  describe('create', () => {
    it('deve criar organização com FormData', async () => {
      const orgData: OrganizationFormValues = {
        name: 'New Organization',
        acronym: 'NO',
        description: 'New Org Description',
        tipo: 'PROVEDOR',
        status: 'ATIVO',
        logo: null,
      };

      const mockResponse: Organization = { id: 3, ...orgData, tipo: 'PROVEDOR', status: 'ATIVO' };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await organizationService.create(orgData);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/organizations/',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const formData = (mockApi.post.mock.calls[0][1] as FormData);
      expect(formData.get('name')).toBe('New Organization');
      expect(formData.get('tipo')).toBe('PROVEDOR');
      expect(result).toEqual(mockResponse);
    });

    it('deve criar organização com logo', async () => {
      const file = new File(['logo'], 'logo.png', { type: 'image/png' });
      const orgData: OrganizationFormValues = {
        name: 'Org with Logo',
        acronym: 'OWL',
        description: '',
        tipo: 'PARCEIRO',
        status: 'ATIVO',
        logo: file,
      };

      mockApi.post.mockResolvedValue({ data: { id: 1, ...orgData } });

      await organizationService.create(orgData);

      const formData = (mockApi.post.mock.calls[0][1] as FormData);
      expect(formData.get('logo')).toBe(file);
    });
  });

  describe('update', () => {
    it('deve atualizar organização', async () => {
      const updateData: Partial<OrganizationFormValues> = {
        name: 'Updated Name',
        status: 'INATIVO',
      };

      const mockResponse: Organization = { id: 1, name: 'Updated Name', status: 'INATIVO' };

      mockApi.put.mockResolvedValue({ data: mockResponse });

      const result = await organizationService.update(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith(
        '/api/v1/organizations/1',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('deve permitir atualização parcial', async () => {
      mockApi.put.mockResolvedValue({ data: {} as Organization });

      await organizationService.update(1, { acronym: 'NEW' });

      const formData = (mockApi.put.mock.calls[0][1] as FormData);
      expect(formData.get('acronym')).toBe('NEW');
    });
  });

  describe('remove', () => {
    it('deve remover organização', async () => {
      mockApi.delete.mockResolvedValue({});

      await organizationService.remove(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/organizations/1');
    });

    it('deve resolver sem retorno', async () => {
      mockApi.delete.mockResolvedValue({});

      await expect(organizationService.remove(1)).resolves.toBeUndefined();
    });
  });
});

describe('ApiError', () => {
  it('deve criar erro com mensagem', () => {
    const error = new ApiError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.fieldErrors).toBeUndefined();
  });

  it('deve criar erro com fieldErrors', () => {
    const fieldErrors = [{ field: 'name', message: 'Nome é obrigatório' }];
    const error = new ApiError('Validation error', fieldErrors);
    expect(error.message).toBe('Validation error');
    expect(error.fieldErrors).toEqual(fieldErrors);
  });
});

describe('parseOrganizationError', () => {
  it('deve retornar ApiError para erro simples', () => {
    const error = new Error('Simple error');
    const result = parseOrganizationError(error);
    expect(result).toBeInstanceOf(ApiError);
    expect(result.message).toBe('Simple error');
  });

  it('deve extrair detail string', () => {
    const err = new Error('Error') as any;
    err.response = { data: { detail: 'Erro específico' } };
    const result = parseOrganizationError(err);
    expect(result.message).toBe('Erro específico');
  });

  it('deve extrair array de erros de validação do FastAPI', () => {
    const err = new Error('Error') as any;
    err.response = { data: { detail: [{ loc: ['body', 'name'], msg: 'Field required' }] } };
    const result = parseOrganizationError(err);
    expect(result.message).toBe('Erro de validação. Verifique os campos.');
    expect(result.fieldErrors).toEqual([{ field: 'name', message: 'Field required' }]);
  });

  it('deve retornar erro desconhecido para input inválido', () => {
    const result = parseOrganizationError('invalid input');
    expect(result.message).toBe('Erro desconhecido');
  });
});