'use client';

import { useRouter } from 'next/navigation';
import { useState }  from 'react';
import useSWR        from 'swr';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Snackbar, Alert } from '@mui/material';
import HomeIcon             from '@mui/icons-material/Home';
import CorporateFareIcon    from '@mui/icons-material/CorporateFare';
import { useTranslations }  from 'next-intl';

import { ContactPointFormDialog } from '@/features/contacts/components/ContactPointFormDialog';
import { contactService, extractErrorMessage } from '@/features/contacts/services/contactService';
import { organizationService }    from '@/features/contacts/services/organizationService';
import type { ContactPointFormValues } from '@/features/contacts/hooks/useContactPointForm';

export default function ContactsAddPage() {
  const router = useRouter();
  const t = useTranslations('contacts');
  
  // O modal deve estar sempre aberto nesta rota dedicada
  const [open] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Busca as organizações originais para o autocomplete (como no gerenciador)
  const { data: organizations = [] } = useSWR('organizations', () => organizationService.list());

  const handleSubmit = async (values: ContactPointFormValues) => {
    setIsSubmitting(true);
    try {
      await contactService.create(values as any);
      router.push('/utility/contacts/manage');
    } catch (err) {
      setToast({ message: extractErrorMessage(err), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.push('/utility/contacts/manage');
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs de referência (visível atrás do overlay do modal MuiDialog) */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink underline="hover" href="/" display="flex" alignItems="center" gap={0.5} color="inherit">
          <HomeIcon fontSize="small" />
          Home
        </MuiLink>
        <MuiLink underline="hover" href="/utility/contacts/manage" color="inherit">
          {t('title')}
        </MuiLink>
        <Typography color="text.primary" display="flex" alignItems="center" gap={0.5}>
          <CorporateFareIcon fontSize="small" />
          {t('newContact')}
        </Typography>
      </Breadcrumbs>

      <ContactPointFormDialog
        open={open}
        contact={null}
        organizations={organizations}
        isSubmitting={isSubmitting}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
      >
        {toast ? (
          <Alert severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : <Box />}
      </Snackbar>
    </Box>
  );
}
