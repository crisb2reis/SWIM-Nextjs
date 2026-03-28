/**
 * src/lib/logger.ts
 * Logger robusto com suporte a captura global de erros e ingestão no backend.
 */
import api from '@/lib/axios';

const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (!isProd) {
      console.log(`[LOG]: ${message}`, ...args);
    }
  },

  error: (message: string, error?: any, context?: Record<string, any>) => {
    console.error(`[ERROR]: ${message}`, error, context);
    
    // Preparação dos dados para o backend via logService ou chamada direta ao Axios
    const logData = {
      event_type: context?.event_type || 'FRONTEND_ERROR',
      severity: 'ERROR',
      error_message: message,
      stack_trace: error instanceof Error ? error.stack : (error?.stack || undefined),
      metadata: {
        ...context,
        href: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      action: context?.action || 'BROWSER_CAPTURE'
    };

    // Ingestão assíncrona (não-bloqueante)
    api.post('/api/v1/logs/frontend', logData).catch(() => {
      // Falha silenciosa para evitar loops infinitos em caso de erro na própria ingestão (ex: rede offline)
    });
  },

  warn: (message: string, ...args: any[]) => {
    if (!isProd) {
      console.warn(`[WARN]: ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (!isProd) {
      console.info(`[INFO]: ${message}`, ...args);
    }
  },

  /**
   * Ativa os handlers globais do navegador para capturar erros não tratados e rejeições de promessas.
   */
  setupGlobalHandlers: () => {
    if (typeof window === 'undefined') return;

    // Evita múltiplas inicializações
    if ((window as any).__SWIM_LOGGER_ACTIVE__) return;
    (window as any).__SWIM_LOGGER_ACTIVE__ = true;

    window.onerror = (message, source, lineno, colno, error) => {
      logger.error(`Runtime Error: ${message}`, error, {
        source,
        line: lineno,
        column: colno,
        event_type: 'RUNTIME_EXCEPTION'
      });
    };

    window.onunhandledrejection = (event) => {
      logger.error(`Promise Rejection: ${event.reason}`, event.reason, {
        event_type: 'PROMISE_REJECTION'
      });
    };

    console.log('[LOGGER]: Global error handlers initialized.');
  }
};
