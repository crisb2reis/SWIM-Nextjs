import useSWR from 'swr';
import { logService, LogFilter } from '../services/log.service';

/**
 * Hook para buscar logs com suporte a paginação e filtros.
 * 
 * A chave de cache é estruturada deterministicamente para evitar
 * inconsistências causadas pela ordem de chaves em objetos.
 */
export function useLogQuery(skip: number, limit: number, filters?: LogFilter) {
  const { data, error, isLoading, mutate } = useSWR(
    [
      'logs',
      skip,
      limit,
      filters?.event_type ?? null,
      filters?.severity ?? null,
      filters?.user_id ?? null,
      filters?.start_date ?? null,
      filters?.end_date ?? null,
      filters?.resource_type ?? null,
    ],
    () => logService.getLogs(skip, limit, filters)
  );

  return {
    data,
    isLoading,
    isError: !!error,
    mutate
  };
}

/**
 * Hook para buscar estatísticas de logs.
 * 
 * Usa array como cache key para manter consistência com useLogQuery
 * e facilitar revalidação cruzada usando mutate global do SWR.
 */
export function useLogStatisticsQuery() {
  const { data, error, isLoading, mutate } = useSWR(
    ['logs', 'statistics'],
    () => logService.getStatistics()
  );

  return {
    data,
    isLoading,
    isError: !!error,
    mutate
  };
}
