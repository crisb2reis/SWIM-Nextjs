import api from '@/lib/axios';

export interface LogFilter {
  event_type?: string;
  severity?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  resource_type?: string;
  search?: string;
}

export const logService = {
  getLogs: async (skip = 0, limit = 100, filters?: LogFilter) => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (filters) {
      if (filters.event_type) params.append('event_type', filters.event_type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.resource_type) params.append('resource_type', filters.resource_type);
      if (filters.search) params.append('search', filters.search);
    }
    const response = await api.get(`/api/v1/logs?${params.toString()}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/api/v1/logs/statistics');
    return response.data;
  },

  postFrontendError: async (logData: any) => {
    const response = await api.post('/api/v1/logs/frontend', logData);
    return response.data;
  }
};
