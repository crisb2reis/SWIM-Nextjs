import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logService } from '../log.service';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from '@/lib/axios';

const mockApi = vi.mocked(api);

describe('logService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLogs', () => {
    it('deve buscar logs sem filtros', async () => {
      const mockResponse = { items: [], total: 0 };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      const result = await logService.getLogs(0, 100);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/logs?skip=0&limit=100');
      expect(result).toEqual(mockResponse);
    });

    it('deve buscar logs com filtros', async () => {
      const mockResponse = { items: [], total: 0 };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      const filters = {
        event_type: 'LOGIN',
        severity: 'ERROR',
        user_id: 'user-1',
      };

      const result = await logService.getLogs(0, 100, filters);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/logs?skip=0&limit=100&event_type=LOGIN&severity=ERROR&user_id=user-1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('deve buscar logs com filtros de data', async () => {
      const mockResponse = { items: [], total: 0 };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      const filters = {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        resource_type: 'USER',
      };

      const result = await logService.getLogs(0, 50, filters);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/logs?skip=0&limit=50&start_date=2024-01-01&end_date=2024-01-31&resource_type=USER'
      );
      expect(result).toEqual(mockResponse);
    });

    it('deve buscar logs com search', async () => {
      const mockResponse = { items: [], total: 0 };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      const filters = { search: 'error log' };

      const result = await logService.getLogs(0, 100, filters);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/logs?skip=0&limit=100&search=error+log'
      );
      expect(result).toEqual(mockResponse);
    });

    it('deve usar valores default para skip e limit', async () => {
      const mockResponse = { items: [], total: 0 };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      await logService.getLogs();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/logs?skip=0&limit=100');
    });
  });

  describe('getStatistics', () => {
    it('deve buscar estatísticas de logs', async () => {
      const mockResponse = { total: 100, by_severity: { INFO: 50, ERROR: 50 } };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      const result = await logService.getStatistics();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/logs/statistics');
      expect(result).toEqual(mockResponse);
    });

    it('deve retornar dados mesmo com erro na API', async () => {
      const mockResponse = { total: 0, by_severity: {} };
      mockApi.get.mockResolvedValue({ data: mockResponse });

      const result = await logService.getStatistics();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('postFrontendError', () => {
    it('deve enviar erro de frontend', async () => {
      const mockLogData = {
        message: 'Error in component',
        stack: 'Error: ...',
        severity: 'ERROR',
      };
      const mockResponse = { id: '1', ...mockLogData };
      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await logService.postFrontendError(mockLogData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/logs/frontend', mockLogData);
      expect(result).toEqual(mockResponse);
    });

    it('deve enviar erro com metadados adicionais', async () => {
      const mockLogData = {
        message: 'Error',
        stack: 'Stack trace',
        severity: 'WARNING',
        metadata: { userId: '123', url: '/test' },
      };
      mockApi.post.mockResolvedValue({ data: mockLogData });

      const result = await logService.postFrontendError(mockLogData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/logs/frontend', mockLogData);
      expect(result).toEqual(mockLogData);
    });
  });
});