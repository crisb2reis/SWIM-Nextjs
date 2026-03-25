'use client';

/**
 * Módulo: features/documents/DocumentsContainer.tsx
 * Descrição: Container component — orquestra estado, hooks e componentes de apresentação.
 *             Segue o padrão Container/Presentation (Separation of Concerns).
 */

import { useState, useCallback } from 'react';
import { Box, Container, Typography, Breadcrumbs, Link, Snackbar, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import { useTranslations } from 'next-intl';

import dynamic from 'next/dynamic';

import { useDocuments }         from './hooks/useDocuments';
import { useDocumentMutations } from './hooks/useDocumentMutations';

const DocumentTable = dynamic(() => import('./components/DocumentTable').then(mod => mod.DocumentTable), { ssr: false });

const DocumentFormDialog  = dynamic(() => import('./components/DocumentFormDialog').then(mod => mod.DocumentFormDialog), { ssr: false });
const DocumentViewDialog  = dynamic(() => import('./components/DocumentViewDialog').then(mod => mod.DocumentViewDialog), { ssr: false });
const DeleteConfirmDialog = dynamic(() => import('./components/DeleteConfirmDialog').then(mod => mod.DeleteConfirmDialog), { ssr: false });

import type { Document }         from './types/document.types';
import type { DocumentFormValues } from './hooks/useDocumentForm';

// ─── Tipos de estado interno ──────────────────────────────────────────────────

type DialogMode = 'add' | 'edit' | 'delete' | 'view' | null;

interface DialogState {
  mode:     DialogMode;
  document: Document | null;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function DocumentsContainer() {
  const t = useTranslations('documents');
  const commonT = useTranslations('common');
  // ─── Estado local do módulo ────────────────────────────────────────────────
  const [dialog, setDialog] = useState<DialogState>({ mode: null, document: null });
  const [toast,  setToast]  = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // ─── Dados e mutações ──────────────────────────────────────────────────────
  const { documents, isLoading, isError, errorMessage, mutate } = useDocuments();

  const mutations = useDocumentMutations(() => {
    mutate(); // revalida a listagem após qualquer mutação
  });

  // ─── Handlers de navegação ─────────────────────────────────────────────────
  const openAdd    = useCallback(() => setDialog({ mode: 'add',    document: null }), []);
  const openEdit   = useCallback((doc: Document) => setDialog({ mode: 'edit',   document: doc }), []);
  const openDelete = useCallback((doc: Document) => setDialog({ mode: 'delete', document: doc }), []);
  const openView   = useCallback((doc: Document) => setDialog({ mode: 'view',   document: doc }), []);
  const closeDialog = useCallback(() => setDialog({ mode: null, document: null }), []);

  const showToast = useCallback((message: string, severity: 'success' | 'error') => {
    setToast({ message, severity });
  }, []);

  // ─── Handlers de submit ────────────────────────────────────────────────────
  const handleCreate = useCallback(async (values: DocumentFormValues) => {
    const ok = await mutations.create(values);
    if (ok) {
      showToast(t('messages.created'), 'success');
      closeDialog();
    } else {
      showToast(mutations.error ?? commonT('errorOccurred'), 'error');
    }
  }, [mutations, showToast, closeDialog, t, commonT]);

  const handleUpdate = useCallback(async (values: DocumentFormValues) => {
    if (!dialog.document?.id) return;
    const ok = await mutations.update(dialog.document.id, values);
    if (ok) {
      showToast(t('messages.updated'), 'success');
      closeDialog();
    } else {
      showToast(mutations.error ?? commonT('errorOccurred'), 'error');
    }
  }, [dialog.document, mutations, showToast, closeDialog, t, commonT]);

  const handleDelete = useCallback(async () => {
    if (!dialog.document?.id) return;
    const ok = await mutations.remove(dialog.document.id);
    if (ok) {
      showToast(t('messages.deleted'), 'success');
      closeDialog();
    } else {
      showToast(mutations.error ?? commonT('errorOccurred'), 'error');
    }
  }, [dialog.document, mutations, showToast, closeDialog, t, commonT]);

  // ─── Render ────────────────────────────────────────────────────────────────
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
            <ArticleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {t('title')}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerenciamento centralizado de documentos, normas e publicações técnicas do ecossistema SWIM.
        </Typography>
      </Box>

      {/* Tabela principal */}
      <DocumentTable
        documents={documents}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={openDelete}
        onView={openView}
      />

      {/* Dialog de criação / edição */}
      <DocumentFormDialog
        open={dialog.mode === 'add' || dialog.mode === 'edit'}
        document={dialog.mode === 'edit' ? dialog.document : null}
        isSubmitting={mutations.isSubmitting}
        onClose={closeDialog}
        onSubmit={dialog.mode === 'add' ? handleCreate : handleUpdate}
      />

      {/* Dialog de visualização */}
      <DocumentViewDialog
        open={dialog.mode === 'view'}
        document={dialog.document}
        onClose={closeDialog}
        onEdit={(doc) => { closeDialog(); setTimeout(() => openEdit(doc), 50); }}
      />

      {/* Dialog de confirmação de exclusão */}
      <DeleteConfirmDialog
        open={dialog.mode === 'delete'}
        documentName={dialog.document?.title ?? ''}
        isDeleting={mutations.isSubmitting}
        onCancel={closeDialog}
        onConfirm={handleDelete}
      />

      {/* Toast de feedback */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            onClose={() => setToast(null)}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            {toast.message}
          </Alert>
        ) : <Box />}
      </Snackbar>
    </Container>
  );
}
