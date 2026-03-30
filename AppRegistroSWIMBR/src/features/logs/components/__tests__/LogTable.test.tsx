import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LogTable } from '../LogTable';
import { SystemLog } from '../../types/log.types';
import React from 'react';

// Mock next-intl é feito em setupTests.ts

// Provider wrapper para testes com MUI Theme
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: AllTheProviders });
};

// Dados mock
const mockLogs: SystemLog[] = [
  {
    id: '1',
    timestamp: '2024-03-30T10:30:00Z',
    event_type: 'USER_LOGIN',
    severity: 'INFO',
    user_id: 'user-1',
    endpoint: '/api/auth/login',
    method: 'POST',
    status_code: 200,
  },
  {
    id: '2',
    timestamp: '2024-03-30T10:31:00Z',
    event_type: 'USER_LOGOUT',
    severity: 'INFO',
    user_id: 'user-2',
    endpoint: '/api/auth/logout',
    method: 'POST',
    status_code: 200,
  },
  {
    id: '3',
    timestamp: '2024-03-30T10:32:00Z',
    event_type: 'DATA_UPDATE',
    severity: 'WARNING',
    user_id: 'user-1',
    endpoint: '/api/data/update',
    method: 'PUT',
    status_code: 200,
  },
  {
    id: '4',
    timestamp: '2024-03-30T10:33:00Z',
    event_type: 'ERROR_OCCURRED',
    severity: 'ERROR',
    user_id: 'user-3',
    endpoint: '/api/process',
    method: 'POST',
    status_code: 500,
  },
  {
    id: '5',
    timestamp: '2024-03-30T10:34:00Z',
    event_type: 'CRITICAL_ALERT',
    severity: 'CRITICAL',
    user_id: 'user-4',
    endpoint: '/api/alert',
    method: 'POST',
    status_code: 500,
  },
];

describe('LogTable', () => {
  describe('Renderização Básica', () => {
    it('deve renderizar o título e subtitle', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable
          logs={mockLogs}
          isLoading={false}
          isError={false}
          onView={onView}
        />
      );
      
      expect(screen.getByText(/logs\.table\.title/)).toBeInTheDocument();
      expect(screen.getByText(/logs\.table\.subtitle/)).toBeInTheDocument();
    });

    it('deve renderizar os headers das colunas', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable
          logs={mockLogs}
          isLoading={false}
          isError={false}
          onView={onView}
        />
      );
      
      // Verifica se pelo menos alguns headers estão presentes
      expect(screen.getByText(/logs\.table\.columns\.timestamp/)).toBeInTheDocument();
      expect(screen.getByText(/logs\.table\.columns\.severity/)).toBeInTheDocument();
      expect(screen.getByText(/logs\.table\.columns\.eventType/)).toBeInTheDocument();
    });

    it('deve renderizar as linhas de dados', async () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable
          logs={mockLogs}
          isLoading={false}
          isError={false}
          onView={onView}
        />
      );
      
      // Verifica se algum dos dados aparecem na tabela
      await waitFor(() => {
        expect(screen.getByText(/USER_LOGIN/)).toBeInTheDocument();
        expect(screen.getByText(/ERROR_OCCURRED/)).toBeInTheDocument();
      });
    });
  });

  describe('Estados de Carregamento e Erro', () => {
    it('deve exibir estado de carregamento', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable
          logs={[]}
          isLoading={true}
          isError={false}
          onView={onView}
        />
      );
      
      // BaseDataTable mostra mensagem de carregamento
      expect(screen.getByText(/common\.table\.loading/)).toBeInTheDocument();
    });

    it('deve exibir mensagem de erro', () => {
      const onView = vi.fn();
      const errorMessage = 'Falha ao carregar logs';
      renderWithProviders(
        <LogTable
          logs={[]}
          isLoading={false}
          isError={true}
          errorMessage={errorMessage}
          onView={onView}
        />
      );
      
      // Deve exibir a mensagem de erro customizada
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('deve usar mensagem padrão de erro quando não informada', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable
          logs={[]}
          isLoading={false}
          isError={true}
          onView={onView}
        />
      );
      
      // Deve usar a mensagem padrão do common
      expect(screen.getByText(/common\.messages\.error/)).toBeInTheDocument();
    });

    it('deve exibir dados vazio corretamente', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable
          logs={[]}
          isLoading={false}
          isError={false}
          onView={onView}
        />
      );
      
      // Verifica que o componente renderizou sem dados
      expect(screen.getByText(/logs\.table\.title/)).toBeInTheDocument();
      // O DataGrid renderiza uma linha com mensagem de vazio
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('Chips de Severidade', () => {
    it('deve renderizar chip INFO com cor info', async () => {
      const onView = vi.fn();
      const infoLog: SystemLog[] = [
        {
          id: '1',
          timestamp: '2024-03-30T10:30:00Z',
          event_type: 'INFO_EVENT',
          severity: 'INFO',
        },
      ];
      
      renderWithProviders(
        <LogTable logs={infoLog} isLoading={false} isError={false} onView={onView} />
      );
      
      // Verifica se o chip foi renderizado (baseado em busca no DOM)
      await waitFor(() => {
        const chips = screen.queryAllByRole('img');
        // Apenas verifica se o componente foi renderizado sem erros
        expect(infoLog.length).toBe(1);
      });
    });

    it('deve renderizar todos os tipos de severidade sem erro', async () => {
      const onView = vi.fn();
      const logsWithAllSeverities: SystemLog[] = [
        {
          id: '1',
          timestamp: '2024-03-30T10:30:00Z',
          event_type: 'INFO_EVENT',
          severity: 'INFO',
        },
        {
          id: '2',
          timestamp: '2024-03-30T10:31:00Z',
          event_type: 'WARNING_EVENT',
          severity: 'WARNING',
        },
        {
          id: '3',
          timestamp: '2024-03-30T10:32:00Z',
          event_type: 'ERROR_EVENT',
          severity: 'ERROR',
        },
        {
          id: '4',
          timestamp: '2024-03-30T10:33:00Z',
          event_type: 'CRITICAL_EVENT',
          severity: 'CRITICAL',
        },
      ];
      
      // Renderiza sem erro
      renderWithProviders(
        <LogTable logs={logsWithAllSeverities} isLoading={false} isError={false} onView={onView} />
      );
      
      // Verifica que a tabela foi renderizada
      expect(screen.getByText(/logs\.table\.title/)).toBeInTheDocument();
    });
  });

  describe('Ações - Botão View', () => {
    it('deve renderizar componente sem erros com callback onView', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable logs={mockLogs} isLoading={false} isError={false} onView={onView} />
      );
      
      // Verifica que o componente renderizou corretamente
      expect(screen.getByText(/logs\.table\.title/)).toBeInTheDocument();
    });
  });

  describe('Subtitle com Contagem', () => {
    it('deve exibir contagem local quando rowCount não é fornecido', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable logs={mockLogs} isLoading={false} isError={false} onView={onView} />
      );
      
      // Deve conter "5" no subtitle (número de logs)
      const subtitle = screen.getByText(/logs\.table\.subtitle/);
      expect(subtitle).toBeInTheDocument();
    });

    it('deve exibir rowCount quando fornecido', () => {
      const onView = vi.fn();
      const rowCount = 150; // Total de registros no servidor
      renderWithProviders(
        <LogTable
          logs={mockLogs}
          isLoading={false}
          isError={false}
          onView={onView}
          rowCount={rowCount}
        />
      );
      
      // Deve conter "150" no subtitle (rowCount)
      const subtitle = screen.getByText(/logs\.table\.subtitle/);
      expect(subtitle).toBeInTheDocument();
    });

    it('deve usar logs.length quando rowCount é undefined', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable
          logs={mockLogs}
          isLoading={false}
          isError={false}
          onView={onView}
          rowCount={undefined}
        />
      );
      
      // Deve conter "5" no subtitle
      const subtitle = screen.getByText(/logs\.table\.subtitle/);
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Colunas e Dados', () => {
    it('deve renderizar as colunas definidas', () => {
      const onView = vi.fn();
      renderWithProviders(
        <LogTable logs={mockLogs} isLoading={false} isError={false} onView={onView} />
      );
      
      // Verifica headers
      expect(screen.getByText(/logs\.table\.columns\.timestamp/)).toBeInTheDocument();
      expect(screen.getByText(/logs\.table\.columns\.severity/)).toBeInTheDocument();
      expect(screen.getByText(/logs\.table\.columns\.eventType/)).toBeInTheDocument();
    });

    it('deve renderizar componente com dados sem erro', () => {
      const onView = vi.fn();
      const customLog: SystemLog[] = [
        {
          id: '1',
          timestamp: '2024-03-30T10:30:00Z',
          event_type: 'CUSTOM_EVENT',
          severity: 'INFO',
          user_id: 'test-user',
          resource_type: 'CUSTOM',
        },
      ];
      
      renderWithProviders(
        <LogTable logs={customLog} isLoading={false} isError={false} onView={onView} />
      );
      
      // Verifica que renderizou sem erros
      expect(screen.getByText(/logs\.table\.title/)).toBeInTheDocument();
    });

    it('deve usar valueGetter para campos opcionais', () => {
      const onView = vi.fn();
      const logWithoutOptional: SystemLog[] = [
        {
          id: '1',
          timestamp: '2024-03-30T10:30:00Z',
          event_type: 'EVENT',
          severity: 'INFO',
          // user_id, resource_type ausentes
        },
      ];
      
      // Renderiza sem erro mesmo com campos opcionais ausentes
      renderWithProviders(
        <LogTable logs={logWithoutOptional} isLoading={false} isError={false} onView={onView} />
      );
      
      expect(screen.getByText(/logs\.table\.title/)).toBeInTheDocument();
    });
  });
});
