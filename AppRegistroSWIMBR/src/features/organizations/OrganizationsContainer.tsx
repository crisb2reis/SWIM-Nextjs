'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Box, Container, Typography, Breadcrumbs, Link, Alert, Snackbar } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslations } from 'next-intl';

import {
  organizationService,
  parseOrganizationError,
  ApiError
} from './services/organizationService';
import { OrganizationTable } from './components/OrganizationTable';
import { OrganizationFormDialog } from './components/OrganizationFormDialog';
import type { Organization, OrganizationFormValues } from './types/organization.types';

export function OrganizationsContainer() {
  const t = useTranslations('organizations');

  // --- Estados de UI ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // --- Fetch de Dados ---
  const { data: organizations = [], error, isLoading, mutate } = useSWR(
    'organizations-manage',
    () => organizationService.list()
  );

  // --- Handlers ---
  const handleAdd = () => { setSelectedOrg(null); setDialogOpen(true); };
  const handleEdit = (org: Organization) => { setSelectedOrg(org); setDialogOpen(true); };

  const handleDelete = async (org: Organization) => {
    if (confirm(t('messages.deleteWarning', { name: org.name }))) {
      try {
        await organizationService.remove(org.id);
        mutate();
        setSnackbar({ open: true, message: t('messages.deleted'), severity: 'success' });
      } catch (err) {
        const parsed = parseOrganizationError(err);
        setSnackbar({ open: true, message: parsed.message, severity: 'error' });
      }
    }
  };

  const handleFormSubmit = async (values: OrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedOrg) {
        await organizationService.update(selectedOrg.id, values);
        setSnackbar({ open: true, message: t('messages.updated'), severity: 'success' });
      } else {
        await organizationService.create(values);
        setSnackbar({ open: true, message: t('messages.created'), severity: 'success' });
      }
      setDialogOpen(false);
      mutate();
    } catch (err) {
      const parsed = parseOrganizationError(err);
      if (parsed instanceof ApiError && parsed.fieldErrors) {
         throw parsed;
      }
      setSnackbar({ open: true, message: parsed.message, severity: 'error' });
      throw new Error("Handled above"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho Premium */}
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BusinessIcon fontSize="inherit" />
            {t('title')}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {t('managementTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('pageSubtitle')}
        </Typography>
      </Box>

      {/* Tabela Principal */}
      <OrganizationTable
        organizations={organizations}
        isLoading={isLoading}
        isError={!!error}
        errorMessage={error ? parseOrganizationError(error).message : undefined}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulário */}
      <OrganizationFormDialog
        open={dialogOpen}
        organization={selectedOrg}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Toast de Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
