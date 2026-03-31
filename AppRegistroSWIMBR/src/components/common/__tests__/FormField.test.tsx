import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';

vi.mock('react-hook-form', () => ({
  Controller: ({ render }: any) => render({ field: { name: 'test', value: '', onChange: vi.fn(), onBlur: vi.fn() } }),
  useForm: () => ({ control: {} }),
}));

describe('FormField', () => {
  it('deve renderizar com label', () => {
    render(
      <FormField
        name="nome"
        control={{} as any}
        label="Nome"
        icon={<span />}
      />
    );

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
  });

  it('deve renderizar com erro', () => {
    const error = { type: 'required', message: 'Obrigatório' } as any;

    render(
      <FormField
        name="nome"
        control={{} as any}
        label="Nome"
        icon={<span />}
        error={error}
      />
    );

    expect(screen.getByText('Obrigatório')).toBeInTheDocument();
  });

  it('deve renderizar icon', () => {
    const icon = <span data-testid="test-icon" />;

    render(
      <FormField
        name="test"
        control={{} as any}
        label="Test"
        icon={icon}
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});