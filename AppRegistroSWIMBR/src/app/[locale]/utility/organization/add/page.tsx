'use client';

import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Snackbar, Alert, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslations } from 'next-intl';

import dynamic from 'next/dynamic';
const OrganizationFormDialog = dynamic(
  () => import('@/features/organizations/components/OrganizationFormDialog').then(mod => mod.OrganizationFormDialog),
  { ssr: false }
);
import {
  organizationService,
  parseOrganizationError,
  ApiError
} from '@/features/organizations/services/organizationService';
import type { OrganizationFormValues } from '@/features/organizations/types/organization.types';

export default function OrganizationAddPage() {
  const router = useRouter();
  const t = useTranslations('organizations');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handleSubmit = async (values: OrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      await organizationService.create(values);
      router.push('/utility/organization/manage');
    } catch (err) {
      const parsed = parseOrganizationError(err);
      if (parsed instanceof ApiError && parsed.fieldErrors) {
         throw parsed; // Deixa o componente interno (Dialog) tratar erros de campo
      }
      setToast({ message: parsed.message, severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => router.push('/utility/organization/manage');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink underline="hover" href="/" display="flex" alignItems="center" gap={0.5} color="inherit">
            <HomeIcon fontSize="small" />
            Home
          </MuiLink>
          <MuiLink underline="hover" href="/utility/organization/manage" color="inherit">
            {t('title')}
          </MuiLink>
          <Typography color="text.primary" display="flex" alignItems="center" gap={0.5}>
            <BusinessIcon fontSize="small" />
            {t('newOrganization')}
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" fontWeight={800} gutterBottom>
           {t('newOrganization')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
           {t('messages.addSubtitle')}
        </Typography>
      </Box>

      {/* O Dialog é renderizado sempre aberto nesta página */}
      <OrganizationFormDialog
        open={true}
        organization={null}
        isSubmitting={isSubmitting}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />

      <Snackbar 
        open={!!toast} 
        autoHideDuration={6000} 
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" sx={{ width: '100%' }}>{toast.message}</Alert>
        ) : <Box />}
      </Snackbar>
    </Container>
  );
}
