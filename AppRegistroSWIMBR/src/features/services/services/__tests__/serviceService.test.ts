import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serviceService, extractServiceErrorMessage } from '../serviceService';
import type { ServiceFormValues, Service } from '@/features/services/types/service.types';
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

describe('serviceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('deve listar todos os serviços', async () => {
      const mockServices: Service[] = [
        { id: 1, name: 'Service 1', status: 'ATIVO', tipo: 'REST' },
        { id: 2, name: 'Service 2', status: 'INATIVO', tipo: 'SOAP' },
      ];

      mockApi.get.mockResolvedValue({ data: mockServices });

      const result = await serviceService.list();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/services/', { params: {} });
      expect(result).toEqual(mockServices);
    });

    it('deve listar com filtro de busca', async () => {
      const mockServices: Service[] = [
        { id: 1, name: 'Flight Data', status: 'ATIVO' },
      ];

      mockApi.get.mockResolvedValue({ data: mockServices });

      const result = await serviceService.list('Flight');

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/services/', { params: { search: 'Flight' } });
      expect(result).toEqual(mockServices);
    });

    it('deve retornar array vazio quando não houver serviços', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await serviceService.list();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('deve buscar serviço por ID', async () => {
      const mockService: Service = { id: 1, name: 'Test Service', status: 'ATIVO', tipo: 'REST' };

      mockApi.get.mockResolvedValue({ data: mockService });

      const result = await serviceService.getById(1);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/services/1');
      expect(result).toEqual(mockService);
    });
  });

  describe('create', () => {
    it('deve criar novo serviço', async () => {
      const serviceData: ServiceFormValues = {
        name: 'New Service',
        organization: 'DECEA',
        version: '1.0',
        status: 'EM_APROVACAO',
        life_cycle: 'PROPOSTA',
        tipo: 'REST',
        publish_status: 'RASCUNHO',
      };

      const mockResponse: Service = { 
        id: 3, 
        name: 'New Service', 
        organization: 'DECEA', 
        version: '1.0', 
        status: 'EM_APROVACAO', 
        life_cycle: 'PROPOSTA', 
        tipo: 'REST', 
        publish_status: 'RASCUNHO' 
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await serviceService.create(serviceData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/services/', serviceData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('deve atualizar serviço', async () => {
      const updateData: Partial<ServiceFormValues> = {
        name: 'Updated Service',
        status: 'ATIVO',
      };

      const mockResponse: Service = { id: 1, name: 'Updated Service', status: 'ATIVO' };

      mockApi.put.mockResolvedValue({ data: mockResponse });

      const result = await serviceService.update(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/services/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('deve permitir atualização parcial', async () => {
      mockApi.put.mockResolvedValue({ data: {} as Service });

      await serviceService.update(1, { version: '2.0' });

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/services/1', { version: '2.0' });
    });
  });

  describe('remove', () => {
    it('deve remover serviço', async () => {
      mockApi.delete.mockResolvedValue({});

      await serviceService.remove(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/services/1');
    });

    it('deve resolver sem retorno', async () => {
      mockApi.delete.mockResolvedValue({});

      await expect(serviceService.remove(1)).resolves.toBeUndefined();
    });
  });
});

describe('extractServiceErrorMessage', () => {
  it('deve extrair mensagem de detail string', () => {
    const error = new AxiosError('Request failed') as any;
    error.response = { data: { detail: 'Erro específico' } };

    expect(extractServiceErrorMessage(error)).toBe('Erro específico');
  });

  it('deve extrair mensagem de array detail', () => {
    const error = new AxiosError('Request failed') as any;
    error.response = { data: { detail: [{ msg: 'Erro de validação' }] } };

    expect(extractServiceErrorMessage(error)).toBe('Erro de validação');
  });

  it('deve usar mensagem do Axios como fallback', () => {
    const error = new AxiosError('Network Error');

    expect(extractServiceErrorMessage(error)).toBe('Network Error');
  });

  it('deve retornar erro desconhecido para input inválido', () => {
    expect(extractServiceErrorMessage('invalid')).toBe('Erro desconhecido');
  });
});