/**
 * features/services/ServicesContainer.tsx
 * Container component – orquestra estado, hooks e componentes de apresentação usando SWR e Axios.
 */
'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import {
  Box, Container, Typography, Breadcrumbs,
  Link, Snackbar, Alert,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const ServiceTable = dynamic(() => import('./components/ServiceTable').then(mod => mod.ServiceTable), { ssr: false });
import { serviceService, extractServiceErrorMessage } from './services/serviceService';
import type { Service, ServiceFormValues } from './types/service.types';

const ServiceFormDialog   = dynamic(() => import('./components/ServiceFormDialog').then(m => m.ServiceFormDialog),   { ssr: false });
const DeleteConfirmDialog = dynamic(() => import('@/features/documents/components/DeleteConfirmDialog').then(m => m.DeleteConfirmDialog), { ssr: false });

type DialogMode  = 'add' | 'edit' | 'delete' | null;

interface DialogState {
  mode:    DialogMode;
  service: Service | null;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ServicesContainer() {
  const t = useTranslations('services');

  // --- Estados de UI ---
  const [dialog, setDialog] = useState<DialogState>({ mode: null, service: null });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // --- Fetch de Dados via SWR ---
  const { data: services = [], error, isLoading, mutate } = useSWR(
    'services',
    () => serviceService.list()
  );

  const openAdd    = useCallback(() => setDialog({ mode: 'add',    service: null }), []);
  const openEdit   = useCallback((svc: Service) => setDialog({ mode: 'edit',   service: svc }), []);
  const openDelete = useCallback((svc: Service) => setDialog({ mode: 'delete', service: svc }), []);
  const closeDialog = useCallback(() => setDialog({ mode: null, service: null }), []);

  const showToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToast({ message, severity });
  }, []);

  const handleCreate = useCallback(async (values: ServiceFormValues) => {
    setSubmitting(true);
    try {
      await serviceService.create(values);
      showToast(t('messages.created'), 'success');
      mutate();
      closeDialog();
    } catch (err) {
      showToast(extractServiceErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }, [t, showToast, closeDialog, mutate]);

  const handleUpdate = useCallback(async (values: ServiceFormValues) => {
    if (!dialog.service) return;
    setSubmitting(true);
    try {
      await serviceService.update(dialog.service.id, values);
      showToast(t('messages.updated'), 'success');
      mutate();
      closeDialog();
    } catch (err) {
      showToast(extractServiceErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }, [dialog.service, t, showToast, closeDialog, mutate]);

  const handleDelete = useCallback(async () => {
    if (!dialog.service) return;
    setSubmitting(true);
    try {
      await serviceService.remove(dialog.service.id);
      showToast(t('messages.deleted'), 'success');
      mutate();
      closeDialog();
    } catch (err) {
      showToast(extractServiceErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }, [dialog.service, t, showToast, closeDialog, mutate]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header & Breadcrumbs */}
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <MiscellaneousServicesIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {t('title')} {/* Ajustado para não repetir Management na Breadcrumb se não quiser */}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {t('managementTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('pageSubtitle')}
        </Typography>
      </Box>

      {/* Tabela */}
      <ServiceTable
        services={services}
        isLoading={isLoading}
        isError={!!error}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* Dialog de criação / edição */}
      <ServiceFormDialog
        open={dialog.mode === 'add' || dialog.mode === 'edit'}
        service={dialog.mode === 'edit' ? dialog.service : null}
        isSubmitting={submitting}
        onClose={closeDialog}
        onSubmit={dialog.mode === 'add' ? handleCreate : handleUpdate}
      />

      {/* Dialog de deleção */}
      <DeleteConfirmDialog
        open={dialog.mode === 'delete'}
        documentName={dialog.service?.name ?? ''}
        isDeleting={submitting}
        onCancel={closeDialog}
        onConfirm={handleDelete}
      />

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ borderRadius: 2, fontWeight: 600 }}>
            {toast.message}
          </Alert>
        ) : <Box />}
      </Snackbar>
    </Container>
  );
}

