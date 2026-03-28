import { useQuery } from '@tanstack/react-query';
import { logService, LogFilter } from '../services/log.service';

export function useLogQuery(skip: number, limit: number, filters?: LogFilter) {
  return useQuery({
    queryKey: ['logs', skip, limit, filters],
    queryFn: () => logService.getLogs(skip, limit, filters),
  });
}

export function useLogStatisticsQuery() {
  return useQuery({
    queryKey: ['logs-statistics'],
    queryFn: () => logService.getStatistics(),
  });
}
