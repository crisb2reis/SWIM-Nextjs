import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { documentService, extractErrorMessage } from '../documentService';
import type { DocumentFormValues } from '@/features/documents/types/document.types';
import { AxiosError } from 'axios';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  BASE_URL: 'http://localhost:3000',
}));

import api from '@/lib/axios';

const mockApi = vi.mocked(api);

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('list', () => {
    it('deve listar documentos da API', async () => {
      const mockDocs = [
        { id: 1, title: 'Doc 1', publish: 'Org 1', version: '1.0' },
        { id: 2, title: 'Doc 2', publish: 'Org 2', version: '2.0' },
      ];

      mockApi.get.mockResolvedValue({ data: { data: mockDocs, total: 2 } });

      const result = await documentService.list();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/documents/');
      expect(result).toEqual(mockDocs);
    });

    it('deve retornar array vazio se data não for array', async () => {
      mockApi.get.mockResolvedValue({ data: { data: null, total: 0 } });

      const result = await documentService.list();

      expect(result).toEqual([]);
    });

    it.skip('deve usar modo mock quando token fake existir', async () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => 'fake-dev-token-swimb'),
      });

      const result = await documentService.list();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toBe('Manual de Operações SWIM');
    });
  });

  describe('getById', () => {
    it('deve buscar documento por ID', async () => {
      const mockDoc = { id: 1, title: 'Test Doc', publish: 'Org', version: '1.0' };

      mockApi.get.mockResolvedValue({ data: mockDoc });

      const result = await documentService.getById(1);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/documents/1/');
      expect(result).toEqual(mockDoc);
    });

    it('deve aceitar ID como string', async () => {
      mockApi.get.mockResolvedValue({ data: { id: '1', title: 'Test' } });

      await documentService.getById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/documents/1/');
    });
  });

  describe('create', () => {
    it('deve criar documento com FormData', async () => {
      const docData: DocumentFormValues = {
        title: 'New Document',
        publish: 'DECEA',
        version: '1.0',
        location: 'https://test.com',
        date_issued: '2024-01-01',
        description: 'Test description',
        uploadfile: null,
      };

      const mockResponse = { id: 3, ...docData };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await documentService.create(docData);

      expect(mockApi.post).toHaveBeenCalled();
      const formData = (mockApi.post.mock.calls[0][1] as FormData);
      expect(formData.get('title')).toBe('New Document');
      expect(formData.get('publish')).toBe('DECEA');
      expect(result).toEqual(mockResponse);
    });

    it('deve criar documento com arquivo', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const docData: DocumentFormValues = {
        title: 'With File',
        publish: 'Org',
        version: '1.0',
        location: '',
        date_issued: '',
        uploadfile: file,
      };

      mockApi.post.mockResolvedValue({ data: { id: 1, ...docData } });

      await documentService.create(docData);

      expect(mockApi.post).toHaveBeenCalled();
      const formData = (mockApi.post.mock.calls[0][1] as FormData);
      expect(formData.get('file')).toBe(file);
    });
  });

  describe('update', () => {
    it('deve atualizar documento', async () => {
      const docData: DocumentFormValues = {
        title: 'Updated Title',
        publish: 'DECEA',
        version: '2.0',
        location: '',
        date_issued: '',
      };

      const mockResponse = { id: 1, ...docData };

      mockApi.put.mockResolvedValue({ data: mockResponse });

      const result = await documentService.update(1, docData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/documents/1/', expect.any(FormData));
      expect(result).toEqual(mockResponse);
    });

    it('deve reenviar arquivo apenas se for diferente', async () => {
      const file = new File(['new'], 'new.pdf', { type: 'application/pdf' });
      const docData: DocumentFormValues = {
        title: 'Updated',
        publish: 'Org',
        version: '1.0',
        location: '',
        date_issued: '',
        uploadfile: file,
      };

      mockApi.put.mockResolvedValue({ data: {} });

      await documentService.update(1, docData, null);

      const formData = (mockApi.put.mock.calls[0][1] as FormData);
      expect(formData.get('file')).toBe(file);
    });
  });

  describe('remove', () => {
    it('deve remover documento', async () => {
      mockApi.delete.mockResolvedValue({});

      await documentService.remove(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/documents/1/');
    });

    it('deve resolver promise sem retorno', async () => {
      mockApi.delete.mockResolvedValue({});

      await expect(documentService.remove(1)).resolves.toBeUndefined();
    });
  });

  describe('download', () => {
    it('deve fazer download do arquivo', async () => {
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });
      mockApi.get.mockResolvedValue({ data: mockBlob });

      const result = await documentService.download(1);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/documents/1/file', {
        responseType: 'blob',
      });
      expect(result).toBe(mockBlob);
    });

    it('deve retornar blob mock em modo development', async () => {
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => 'fake-dev-token-swimb'),
      });

      const result = await documentService.download(1);

      expect(result).toBeInstanceOf(Blob);
    });
  });
});

describe('extractErrorMessage', () => {
  it('deve extrair mensagem de detail string', () => {
    const error = new AxiosError('Request failed') as any;
    error.response = { data: { detail: 'Erro específico' } };

    expect(extractErrorMessage(error)).toBe('Erro específico');
  });

  it('deve extrair mensagem de non_field_errors array', () => {
    const error = new AxiosError('Request failed') as any;
    error.response = { data: { non_field_errors: ['Erro de validação'] } };

    expect(extractErrorMessage(error)).toBe('Erro de validação');
  });

  it('deve usar mensagem do Axios como fallback', () => {
    const error = new AxiosError('Network Error');

    expect(extractErrorMessage(error)).toBe('Network Error');
  });
});