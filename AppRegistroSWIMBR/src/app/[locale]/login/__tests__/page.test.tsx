import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import LoginPage from '../page';

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '@/lib/axios';
const mockApi = vi.mocked(api);

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('localStorage', {
      setItem: vi.fn(),
      getItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('deve renderizar o título do projeto', () => {
    render(<LoginPage />);
    expect(screen.getByText('Registro SWIM BR')).toBeInTheDocument();
  });

  it('deve renderizar botão de entrar', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve renderizar link para criar conta', () => {
    render(<LoginPage />);
    expect(screen.getByText('Crie uma conta')).toBeInTheDocument();
  });

  it('deve mostrar botão desabilitado durante loading', async () => {
    let resolveLogin: (value: any) => void;
    mockApi.post.mockImplementation(() => new Promise((resolve) => {
      resolveLogin = resolve;
    }));

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('deve fazer login com sucesso', async () => {
    mockApi.post.mockResolvedValue({
      data: { access_token: 'mock-token-123' },
    });

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await act(async () => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token-123');
    });
  });

  it('deve mostrar erro quando login falha', async () => {
    mockApi.post.mockRejectedValue({
      response: { data: { detail: 'Credenciais inválidas' } },
    });

    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await act(async () => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it.skip('deve mostrar erro de sessão expirada via URL param', () => {
    const { useSearchParams } = require('@/i18n/navigation');
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('error=unauthorized'));
    
    render(<LoginPage />);

    expect(screen.getByText('Sessão expirada. Por favor, faça login novamente.')).toBeInTheDocument();
  });

  it('deve renderizar subtítulo descritivo', () => {
    render(<LoginPage />);
    expect(screen.getByText('Faça login para gerenciar seus documentos')).toBeInTheDocument();
  });
});