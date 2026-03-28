export interface LogChangeItem {
  field?: string;
  old_value?: any;
  new_value?: any;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  event_type: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  user_id?: string;
  user_email?: string;
  user_ip?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  endpoint?: string;
  method?: string;
  status_code?: number;
  response_time_ms?: number;
  changes?: LogChangeItem[];
  metadata?: Record<string, any>;
  error_message?: string;
  stack_trace?: string;
}

export interface LogPaginatedResponse {
  total: number;
  items: SystemLog[];
}
