'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Snackbar, Alert, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import { useTranslations } from 'next-intl';

import { ServiceFormDialog } from '@/features/services/components/ServiceFormDialog';
import { serviceService } from '@/features/services/services/serviceService';
import type { ServiceFormValues } from '@/features/services/types/service.types';

export default function ServicesAddPage() {
  const router = useRouter();
  const t = useTranslations('services');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const handleSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      await serviceService.create(values);
      setToast({ message: t('messages.created'), severity: 'success' });
      // Pequeno delay para o usuário ver o sucesso antes de redirecionar
      setTimeout(() => {
        router.push('/utility/services/manage');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setToast({ 
        message: err.response?.data?.detail || t('messages.loadError'), 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => router.push('/utility/services/manage');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink underline="hover" href="/" display="flex" alignItems="center" gap={0.5} color="inherit">
            <HomeIcon fontSize="small" />
            Home
          </MuiLink>
          <MuiLink underline="hover" href="/utility/services/manage" color="inherit">
            {t('managementTitle')}
          </MuiLink>
          <Typography color="text.primary" display="flex" alignItems="center" gap={0.5}>
            <MiscellaneousServicesIcon fontSize="small" />
            {t('newService')}
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" fontWeight={800} gutterBottom>
           {t('newService')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
           {t('messages.addSubtitle')}
        </Typography>
      </Box>

      {/* Dialog aberto permanentemente nesta rota */}
      <ServiceFormDialog
        open={true}
        service={null}
        isSubmitting={isSubmitting}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />

      <Snackbar 
        open={!!toast} 
        autoHideDuration={4000} 
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
