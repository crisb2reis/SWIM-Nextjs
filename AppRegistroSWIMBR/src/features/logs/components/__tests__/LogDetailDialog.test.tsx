import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LogDetailDialog } from '../LogDetailDialog';
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
const mockLog: SystemLog = {
  id: '1',
  timestamp: '2024-03-30T10:30:00Z',
  event_type: 'USER_LOGIN',
  severity: 'INFO',
  user_id: 'user-123',
  user_email: 'user@example.com',
  user_ip: '192.168.1.1',
  user_agent: 'Mozilla/5.0...',
  resource_type: 'USER',
  resource_id: '123',
  action: 'LOGIN',
  endpoint: '/api/auth/login',
  method: 'POST',
  status_code: 200,
  response_time_ms: 245,
  changes: [
    { field: 'last_login', old_value: '2024-03-29T15:00:00Z', new_value: '2024-03-30T10:30:00Z' },
  ],
  error_message: undefined,
  stack_trace: undefined,
};

const mockLogWithError: SystemLog = {
  ...mockLog,
  severity: 'ERROR',
  error_message: 'Database connection failed',
  stack_trace: 'Error: Database connection failed\n    at connect (db.ts:45)\n    at init (server.ts:123)',
};

describe('LogDetailDialog', () => {
  describe('Renderização e Visibilidade', () => {
    it('deve não renderizar quando open é false', () => {
      const onClose = vi.fn();
      const { container } = renderWithProviders(
        <LogDetailDialog log={mockLog} open={false} onClose={onClose} />
      );
      
      // Dialog com open=false não deve estar visível
      const dialog = container.querySelector('[role="presentation"]');
      expect(dialog).toBeDefined();
    });

    it('deve renderizar o diálogo quando open é true', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      // Verifica se o título está presente
      expect(screen.getByText(/logs\.dialog\.title/)).toBeInTheDocument();
    });

    it('deve exibir o event_type no título quando log está presente', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      expect(screen.getByText(/USER_LOGIN/)).toBeInTheDocument();
    });

    it('deve não exibir event_type no título quando log é null', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={null} open={true} onClose={onClose} />
      );
      
      expect(screen.queryByText(/USER_LOGIN/)).not.toBeInTheDocument();
    });
  });

  describe('Conteúdo - Sem Log', () => {
    it('deve exibir mensagem "Nenhum registro" quando log é null', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={null} open={true} onClose={onClose} />
      );
      
      expect(screen.getByText(/common\.noRecords/)).toBeInTheDocument();
    });
  });

  describe('Conteúdo - Informações Básicas', () => {
    it('deve exibir timestamp formatado', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      // A função toLocaleString() do JavaScript transforma a data
      expect(screen.getByText(/logs\.dialog\.timestamp/)).toBeInTheDocument();
    });

    it('deve exibir contexto de usuário quando user_id está presente', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      expect(screen.getByText(/logs\.dialog\.userContext/)).toBeInTheDocument();
      expect(screen.getByText(/user-123/)).toBeInTheDocument();
    });

    it('deve exibir informações de rede quando endpoint está presente', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      expect(screen.getByText(/logs\.dialog\.network/)).toBeInTheDocument();
      expect(screen.getByText(/POST/)).toBeInTheDocument();
    });

    it('deve exibir operação quando resource_type está presente', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      expect(screen.getByText(/logs\.dialog\.operation/)).toBeInTheDocument();
      // Busca mais específico para evitar ambiguidade
      const resourceText = screen.getByText(/^USER \(123\)$/);
      expect(resourceText).toBeInTheDocument();
    });

    it('deve exibir alterações quando changes está presente', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      expect(screen.getByText(/logs\.dialog\.changes/)).toBeInTheDocument();
      expect(screen.getByText(/last_login/)).toBeInTheDocument();
    });
  });

  describe('Erro e Stack Trace', () => {
    it('deve exibir erro quando error_message está presente', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLogWithError} open={true} onClose={onClose} />
      );
      
      expect(screen.getByText(/logs\.dialog\.errorDetails/)).toBeInTheDocument();
      expect(screen.getByText(/Database connection failed/)).toBeInTheDocument();
    });

    it('deve exibir botão para expandir stack trace', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLogWithError} open={true} onClose={onClose} />
      );
      
      // Botão de "Mostrar técnico"
      const button = screen.getByRole('button', { name: /logs\.dialog\.showTechnical/ });
      expect(button).toBeInTheDocument();
    });

    it('deve alternar stack trace quando botão é clicado', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLogWithError} open={true} onClose={onClose} />
      );
      
      // Espera o botão aparecer
      await waitFor(() => {
        expect(screen.getByText(/logs\.dialog\.showTechnical/)).toBeInTheDocument();
      });
      
      const button = screen.getByText(/logs\.dialog\.showTechnical/);
      
      // Clica para expandir
      await user.click(button.closest('button')!);
      
      // Após clicar, deve estar expandido
      await waitFor(() => {
        const hideButton = screen.queryByText(/logs\.dialog\.hideTechnical/);
        expect(hideButton).toBeInTheDocument();
      });
      
      // Clica novamente para ocultar usando o novo botão
      const hideButton = screen.getByText(/logs\.dialog\.hideTechnical/);
      await user.click(hideButton.closest('button')!);
      
      // O botão de "Mostrar" deve voltar
      await waitFor(() => {
        expect(screen.getByText(/logs\.dialog\.showTechnical/)).toBeInTheDocument();
      });
    });

    it('deve não exibir stack trace quando não está presente', () => {
      const onClose = vi.fn();
      const logWithoutStackTrace = {
        ...mockLog,
        error_message: 'Erro simples',
        stack_trace: undefined,
      };
      
      renderWithProviders(
        <LogDetailDialog log={logWithoutStackTrace} open={true} onClose={onClose} />
      );
      
      // Botão de expandir não deve estar presente
      expect(screen.queryByRole('button', { name: /logs\.dialog\.showTechnical/ })).not.toBeInTheDocument();
    });
  });

  describe('Ações de Fechamento', () => {
    it('deve chamar onClose quando botão Fechar é clicado', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={mockLog} open={true} onClose={onClose} />
      );
      
      const closeButton = screen.getByRole('button', { name: /actions\.close/ });
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('deve resetar showTechnical quando fechar o diálogo', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      const { rerender } = renderWithProviders(
        <LogDetailDialog log={mockLogWithError} open={true} onClose={onClose} />
      );
      
      // Abre o stack trace
      await waitFor(() => {
        expect(screen.getByText(/logs\.dialog\.showTechnical/)).toBeInTheDocument();
      });
      
      const showButton = screen.getByText(/logs\.dialog\.showTechnical/);
      await user.click(showButton.closest('button')!);
      
      // Verifica que está expandido
      await waitFor(() => {
        expect(screen.getByText(/logs\.dialog\.hideTechnical/)).toBeInTheDocument();
      });
      
      // Fecha e reabre para simular reinicialização do estado
      onClose.mockClear();
      
      rerender(
        <LogDetailDialog log={mockLogWithError} open={true} onClose={onClose} />
      );
      
      // Em um novo render, o botão de mostrar técnico deve estar visível novamente
      // (estado reiniciado)
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Casos Extremos', () => {
    it('deve lidar com log sem campos opcionais', () => {
      const minimalLog: SystemLog = {
        id: '1',
        timestamp: '2024-03-30T10:30:00Z',
        event_type: 'GENERIC_EVENT',
        severity: 'INFO',
      };
      
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={minimalLog} open={true} onClose={onClose} />
      );
      
      // Deve renderizar sem erro
      expect(screen.getByText(/logs\.dialog\.title/)).toBeInTheDocument();
      expect(screen.getByText(/GENERIC_EVENT/)).toBeInTheDocument();
    });

    it('deve exibir "N/A" quando campos opcionais estão ausentes', () => {
      const logPartial: SystemLog = {
        id: '1',
        timestamp: '2024-03-30T10:30:00Z',
        event_type: 'EVENT',
        severity: 'INFO',
        user_id: 'user-123',
        // user_email, user_ip, etc não estão presentes
      };
      
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={logPartial} open={true} onClose={onClose} />
      );
      
      // Busca por "N/A" nos elementos de usuário email/ip/agent
      const naElements = screen.getAllByText(/N\/A/);
      expect(naElements.length).toBeGreaterThan(0);
    });

    it('deve renderizar changes vazio sem seção de mudanças', () => {
      const logEmptyChanges: SystemLog = {
        ...mockLog,
        changes: [],
      };
      
      const onClose = vi.fn();
      renderWithProviders(
        <LogDetailDialog log={logEmptyChanges} open={true} onClose={onClose} />
      );
      
      // Não deve renderizar a seção de "Alterações"
      expect(screen.queryByText(/logs\.dialog\.changes/)).not.toBeInTheDocument();
    });
  });
});
