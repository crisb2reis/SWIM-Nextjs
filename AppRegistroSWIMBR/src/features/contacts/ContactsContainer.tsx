'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Box, Container, Typography, Breadcrumbs, Link, Alert, Snackbar } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { useTranslations } from 'next-intl';

import { contactService, extractErrorMessage } from './services/contactService';
import { organizationService } from '@/features/organizations/services/organizationService';
import dynamic from 'next/dynamic';
import type { ContactPoint, ContactPointCreate } from './types/contact.types';

const ContactPointTable = dynamic(() => import('./components/ContactPointTable').then(mod => mod.ContactPointTable), { ssr: false });
const ContactPointFormDialog = dynamic(() => import('./components/ContactPointFormDialog').then(mod => mod.ContactPointFormDialog), { ssr: false });

import type { ContactPointFormValues } from './hooks/useContactPointForm';

export function ContactsContainer() {
  const t = useTranslations('contacts');

  // --- Estados de UI ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactPoint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // --- Fetch de Dados ---
  const { data: contacts = [], error, isLoading, mutate } = useSWR('contact-points', () => contactService.list());
  const { data: organizations = [] } = useSWR('organizations', () => organizationService.list());

  // --- Handlers ---
  const handleAdd = () => {
    setSelectedContact(null);
    setDialogOpen(true);
  };

  const handleEdit = (contact: ContactPoint) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  };

  const handleDelete = async (contact: ContactPoint) => {
    if (confirm(t('messages.deleteWarning', { name: contact.name }))) {
      try {
        await contactService.remove(contact.id);
        mutate();
        setSnackbar({ open: true, message: t('messages.deleted'), severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: extractErrorMessage(err), severity: 'error' });
      }
    }
  };

  const handleFormSubmit = async (values: ContactPointFormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedContact) {
        await contactService.update(selectedContact.id, values);
        setSnackbar({ open: true, message: t('messages.updated'), severity: 'success' });
      } else {
        await contactService.create(values as ContactPointCreate);
        setSnackbar({ open: true, message: t('messages.created'), severity: 'success' });
      }
      setDialogOpen(false);
      mutate();
    } catch (err) {
      setSnackbar({ open: true, message: extractErrorMessage(err), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header & Breadcrumbs */}
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <CorporateFareIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {t('title')}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {t('title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerenciamento centralizado de pontos de contato e responsáveis técnicos nas organizações.
        </Typography>
      </Box>

      {/* Tabela Principal */}
      <ContactPointTable
        contacts={contacts}
        isLoading={isLoading}
        isError={!!error}
        errorMessage={extractErrorMessage(error)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Formulário */}
      <ContactPointFormDialog
        open={dialogOpen}
        contact={selectedContact}
        organizations={organizations}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Feedbacks */}
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
