import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { FormField } from '../FormField';
import React from 'react';

// Wrapper para testar comportamento real do formulário se necessário
function TestWrapper({ error }: { error?: any }) {
  const { control } = useForm({ defaultValues: { nome: '' } });
  return (
    <FormField
      name="nome"
      control={control}
      label="Nome"
      placeholder="Digite seu nome"
      icon={<span data-testid="test-icon" />}
      error={error}
    />
  );
}

describe('FormField', () => {
  it('deve renderizar com label e placeholder', () => {
    render(<TestWrapper />);
    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Digite seu nome')).toBeInTheDocument();
  });

  it('deve permitir entrada de texto', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);
    const input = screen.getByPlaceholderText('Digite seu nome') as HTMLInputElement;
    
    await user.type(input, 'Teste');
    expect(input.value).toBe('Teste');
  });

  it('deve exibir mensagem de erro quando presente', () => {
    const mockError = { message: 'Campo obrigatório' } as any;
    render(<TestWrapper error={mockError} />);
    
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toBeInvalid();
  });

  it('deve renderizar o ícone fornecido', () => {
    render(<TestWrapper />);
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
