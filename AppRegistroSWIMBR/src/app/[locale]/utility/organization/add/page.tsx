'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Snackbar, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslations } from 'next-intl';

import { OrganizationFormDialog } from '@/features/organizations/components/OrganizationFormDialog';
import {
  organizationService,
  extractOrganizationErrorMessage,
} from '@/features/contacts/services/organizationService';
import type { OrganizationFormValues } from '@/features/contacts/types/organization.types';

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
      setToast({ message: extractOrganizationErrorMessage(err), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => router.push('/utility/organization/manage');

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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

      <OrganizationFormDialog
        open={true}
        organization={null}
        isSubmitting={isSubmitting}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />

      <Snackbar open={!!toast} autoHideDuration={6000} onClose={() => setToast(null)}>
        {toast ? (
          <Alert severity={toast.severity} sx={{ width: '100%' }}>{toast.message}</Alert>
        ) : <Box />}
      </Snackbar>
    </Box>
  );
}
