'use client';

import { useState, useCallback, useMemo } from 'react';
import { Box, Container, Typography, Breadcrumbs, Link, Snackbar, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import { useTranslations } from 'next-intl';

import { useUsers } from './hooks/useUsers';
import { useUserMutations } from './hooks/useUserMutations';
import { UserTable } from './components/UserTable';
import { UserFormDialog } from './components/UserFormDialog';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { User, UserFormValues } from './types/user.types';

type DialogMode = 'add' | 'edit' | 'delete' | null;

interface DialogState {
  mode: DialogMode;
  user: User | null;
}

export function UsersContainer() {
  const commonT = useTranslations('common');
  const t = useTranslations('common.messages');
  const navT = useTranslations('navigation');
  const regT = useTranslations('registration');
  
  const [dialog, setDialog] = useState<DialogState>({ mode: null, user: null });
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const { users, isLoading, isError, errorMessage, mutate } = useUsers();

  /**
   * PERF-01: Desestruturando funções estáveis do hook para evitar 
   * recriação de callbacks que dependem do objeto mutations inteiro.
   */
  const { 
    create, 
    update, 
    remove, 
    isSubmitting, 
    error: mutationError 
  } = useUserMutations(() => {
    mutate();
  });

  const showToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToast({ message, severity });
  }, []);

  /**
   * QUAL-05: Garantir estado limpo ao fechar diálogos.
   */
  const closeDialog = useCallback(() => {
    setDialog({ mode: null, user: null });
    setToast(null);
  }, []);

  const openAdd = useCallback(() => setDialog({ mode: 'add', user: null }), []);
  const openEdit = useCallback((user: User) => setDialog({ mode: 'edit', user }), []);
  const openDelete = useCallback((user: User) => setDialog({ mode: 'delete', user }), []);

  /**
   * SEC-02: Sanitização de erros do backend antes de exibir ao usuário final.
   */
  const getFriendlyError = useCallback((errorStr: string | null, fallback: string) => {
    if (!errorStr) return fallback;
    // Evita exibir mensagens técnicas internas (ex: stack traces)
    if (errorStr.includes('SQL') || errorStr.includes('Error:') || errorStr.length > 200) {
      return fallback;
    }
    return errorStr;
  }, []);

  /**
   * SEC-01 & QUAL-02: Adicionado try/catch e internacionalização de toasts.
   */
  const handleCreate = useCallback(async (values: UserFormValues) => {
    try {
      const ok = await create(values);
      if (ok) {
        showToast(t('createSuccess'), 'success');
        closeDialog();
      } else {
        showToast(getFriendlyError(mutationError, t('error')), 'error');
      }
    } catch (err) {
      showToast(t('error'), 'error');
    }
  }, [create, t, mutationError, getFriendlyError, showToast, closeDialog]);

  /**
   * SEC-03 & QUAL-01: Captura de ID em ref local e tipagem correta (UserFormValues).
   */
  const handleUpdate = useCallback(async (values: UserFormValues) => {
    const userId = dialog.user?.id;
    if (!userId) return;

    try {
      const ok = await update(userId, values);
      if (ok) {
        showToast(t('updateSuccess'), 'success');
        closeDialog();
      } else {
        showToast(getFriendlyError(mutationError, t('error')), 'error');
      }
    } catch (err) {
      showToast(t('error'), 'error');
    }
  }, [dialog.user, update, t, mutationError, getFriendlyError, showToast, closeDialog]);

  const handleDelete = useCallback(async () => {
    const userId = dialog.user?.id;
    if (!userId) return;

    try {
      const ok = await remove(userId);
      if (ok) {
        showToast(t('deleteSuccess'), 'success');
        closeDialog();
      } else {
        showToast(getFriendlyError(mutationError, t('error')), 'error');
      }
    } catch (err) {
      showToast(t('error'), 'error');
    }
  }, [dialog.user, remove, t, mutationError, getFriendlyError, showToast, closeDialog]);

  /**
   * QUAL-04: Extração de lógica JSX para variáveis derivadas.
   */
  const isFormOpen = dialog.mode === 'add' || dialog.mode === 'edit';
  const formSubmitHandler = dialog.mode === 'add' ? handleCreate : handleUpdate;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {commonT('home')}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {navT('usuarios')}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {regT('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {regT('subtitle')}
        </Typography>
      </Box>

      <UserTable
        users={users}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onAdd={openAdd}
        onEdit={openEdit}
        onDeleteConfirmRequest={openDelete}
      />

      <UserFormDialog
        open={isFormOpen}
        user={dialog.mode === 'edit' ? dialog.user : null}
        isSubmitting={isSubmitting}
        onClose={closeDialog}
        onSubmit={formSubmitHandler}
      />

      <DeleteConfirmDialog
        open={dialog.mode === 'delete'}
        itemName={dialog.user?.nome || ''}
        isDeleting={isSubmitting}
        onCancel={closeDialog}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ borderRadius: 2, boxShadow: 3 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Container>
  );
}
