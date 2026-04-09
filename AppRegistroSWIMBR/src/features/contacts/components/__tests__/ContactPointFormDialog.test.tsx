import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ContactPointFormDialog } from '../ContactPointFormDialog';
import type { ContactPoint } from '../../types/contact.types';
import type { Organization } from '@/features/organizations/types/organization.types';
import React from 'react';

// Mock do next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(component, { wrapper: AllTheProviders });
};

const mockOrganizations: Organization[] = [
  { id: 1, name: 'Org 1', description: 'Desc 1', created_at: '', updated_at: '' },
  { id: 2, name: 'Org 2', description: 'Desc 2', created_at: '', updated_at: '' },
];

const mockContact: ContactPoint = {
  id: 123,
  name: 'João Silva',
  email: 'joao@example.com',
  role: 'Analista',
  phone: '1199999999',
  organization_id: 1,
  organization_name: 'Org 1',
};

describe('ContactPointFormDialog', () => {
  it('deve renderizar campos vazios quando não há contato (Modo Criação)', () => {
    renderWithProviders(
      <ContactPointFormDialog
        open={true}
        contact={null}
        organizations={mockOrganizations}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/form\.nameLabel/)).toHaveValue('');
    expect(screen.getByLabelText(/form\.emailLabel/)).toHaveValue('');
  });

  it('deve vir com campos preenchidos quando um contato é fornecido (Modo Edição)', () => {
    renderWithProviders(
      <ContactPointFormDialog
        open={true}
        contact={mockContact}
        organizations={mockOrganizations}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Analista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1199999999')).toBeInTheDocument();
  });
});
