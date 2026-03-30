import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useSWR from 'swr';
import { useLogQuery, useLogStatisticsQuery } from '../useLogQuery';
import { LogFilter } from '../../services/log.service';
import { SystemLog } from '../../types/log.types';

// Mock para SWR
vi.mock('swr');
vi.mock('../../services/log.service', () => ({
  logService: {
    getLogs: vi.fn(),
    getStatistics: vi.fn(),
  },
}));

import { logService } from '../../services/log.service';

describe('useLogQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cache Key - Determinismo', () => {
    it('deve gerar a mesma cache key para filters com mesmas propriedades', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      const filters1: LogFilter = {
        event_type: 'LOGIN',
        severity: 'INFO',
        user_id: 'user-1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        resource_type: 'USER',
      };

      const filters2: LogFilter = {
        event_type: 'LOGIN',
        severity: 'INFO',
        user_id: 'user-1',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        resource_type: 'USER',
      };

      renderHook(() => useLogQuery(0, 10, filters1));
      const firstCall = mockUseSWR.mock.calls[0][0];

      vi.clearAllMocks();
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useLogQuery(0, 10, filters2));
      const secondCall = mockUseSWR.mock.calls[0][0];

      // As chaves devem ser idênticas
      expect(firstCall).toEqual(secondCall);
    });

    it('deve incluir valores de filtro como parte da cache key', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      const filters: LogFilter = {
        event_type: 'LOGIN',
        severity: 'ERROR',
        user_id: 'user-123',
      };

      renderHook(() => useLogQuery(0, 10, filters));
      const cacheKey = mockUseSWR.mock.calls[0][0] as any[];

      // Verifica se os valores de filtro estão na chave
      expect(cacheKey).toContain('LOGIN');
      expect(cacheKey).toContain('ERROR');
      expect(cacheKey).toContain('user-123');
    });

    it('deve incluir null para filtros não informados', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      const filters: LogFilter = {
        event_type: 'LOGIN',
        // severity não informado
      };

      renderHook(() => useLogQuery(0, 10, filters));
      const cacheKey = mockUseSWR.mock.calls[0][0] as any[];

      // Deve conter null para severity
      const severityIndex = 4; // ['logs', skip, limit, event_type, severity, ...]
      expect(cacheKey[severityIndex]).toBeNull();
    });

    it('deve usar array como estrutura de cache key', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useLogQuery(0, 10));
      const cacheKey = mockUseSWR.mock.calls[0][0];

      // Deve ser um array
      expect(Array.isArray(cacheKey)).toBe(true);
      // Começar com 'logs'
      expect((cacheKey as any[])[0]).toBe('logs');
    });
  });

  describe('Cache Key - Paginação', () => {
    it('deve incluir skip e limit na cache key', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useLogQuery(10, 25));
      const cacheKey = mockUseSWR.mock.calls[0][0] as any[];

      expect(cacheKey[1]).toBe(10); // skip
      expect(cacheKey[2]).toBe(25); // limit
    });

    it('deve gerar cache keys diferentes para skip/limit diferentes', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useLogQuery(0, 10));
      const key1 = mockUseSWR.mock.calls[0][0];

      vi.clearAllMocks();
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useLogQuery(10, 20));
      const key2 = mockUseSWR.mock.calls[0][0];

      expect(key1).not.toEqual(key2);
    });
  });

  describe('Função Fetcher', () => {
    it('deve passar skip, limit e filters para logService.getLogs', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockGetLogs = vi.mocked(logService.getLogs);
      mockGetLogs.mockResolvedValue({
        items: [],
        total: 0,
      } as any);

      mockUseSWR.mockImplementation((key, fetcher) => {
        if (typeof fetcher === 'function') {
          fetcher();
        }
        return {
          data: undefined,
          error: undefined,
          isLoading: true,
          mutate: vi.fn(),
        } as any;
      });

      const filters: LogFilter = { event_type: 'LOGIN' };
      renderHook(() => useLogQuery(5, 20, filters));

      expect(mockGetLogs).toHaveBeenCalledWith(5, 20, filters);
    });
  });

  describe('Retorno do Hook', () => {
    it('deve retornar data do SWR', () => {
      const mockData = [{ id: '1', timestamp: '2024-03-30T10:30:00Z', event_type: 'LOGIN', severity: 'INFO' as const }];
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogQuery(0, 10));

      expect(result.current.data).toEqual(mockData);
    });

    it('deve retornar isLoading como true quando carregando', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogQuery(0, 10));

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar isError como true quando há erro', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockError = new Error('Erro ao buscar');
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogQuery(0, 10));

      expect(result.current.isError).toBe(true);
    });

    it('deve retornar mutate do SWR', () => {
      const mockMutate = vi.fn();
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: mockMutate,
      } as any);

      const { result } = renderHook(() => useLogQuery(0, 10));

      expect(result.current.mutate).toBe(mockMutate);
    });
  });

  describe('Estado de Erro', () => {
    it('deve definir isError como false quando não há erro', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: [],
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogQuery(0, 10));

      expect(result.current.isError).toBe(false);
    });

    it('deve definir isError como true quando há erro', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: { message: 'Network error' },
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogQuery(0, 10));

      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useLogStatisticsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cache Key', () => {
    it('deve usar array como cache key para consistência', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useLogStatisticsQuery());
      const cacheKey = mockUseSWR.mock.calls[0][0];

      // Deve ser um array
      expect(Array.isArray(cacheKey)).toBe(true);
      // Estrutura esperada
      expect((cacheKey as any[]).length).toBe(2);
      expect((cacheKey as any[])[0]).toBe('logs');
      expect((cacheKey as any[])[1]).toBe('statistics');
    });

    it('deve usar cache key estruturada para revalidação cruzada', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      renderHook(() => useLogStatisticsQuery());
      const cacheKey = mockUseSWR.mock.calls[0][0] as any[];

      // Deve ser possível fazer mutate global usando:
      // mutate((key) => Array.isArray(key) && key[0] === 'logs')
      expect(cacheKey[0]).toBe('logs');
    });
  });

  describe('Função Fetcher', () => {
    it('deve chamar logService.getStatistics', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockGetStatistics = vi.mocked(logService.getStatistics);
      mockGetStatistics.mockResolvedValue({ total: 100, by_severity: {} } as any);

      mockUseSWR.mockImplementation((key, fetcher) => {
        if (typeof fetcher === 'function') {
          fetcher();
        }
        return {
          data: undefined,
          error: undefined,
          isLoading: true,
          mutate: vi.fn(),
        } as any;
      });

      renderHook(() => useLogStatisticsQuery());

      expect(mockGetStatistics).toHaveBeenCalled();
    });
  });

  describe('Retorno do Hook', () => {
    it('deve retornar data, isLoading, isError e mutate', () => {
      const mockData = { total: 100, by_severity: { INFO: 50, ERROR: 50 } };
      const mockMutate = vi.fn();
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
      } as any);

      const { result } = renderHook(() => useLogStatisticsQuery());

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.mutate).toBe(mockMutate);
    });

    it('deve indicar erro quando getStatistics falha', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('Failed to fetch statistics'),
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogStatisticsQuery());

      expect(result.current.isError).toBe(true);
    });
  });

  describe('Estado de Carregamento', () => {
    it('deve indicar quando está carregando', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogStatisticsQuery());

      expect(result.current.isLoading).toBe(true);
    });

    it('deve indicar quando carregamento terminou com sucesso', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: { total: 100 },
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      } as any);

      const { result } = renderHook(() => useLogStatisticsQuery());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});
