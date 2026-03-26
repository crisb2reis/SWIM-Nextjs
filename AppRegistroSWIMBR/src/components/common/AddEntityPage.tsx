'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Snackbar, Alert, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface GenericFormDialogProps<TForm> {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: TForm) => Promise<void>;
  [key: string]: any;
}

export interface AddEntityPageProps<TForm> {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle: string;
  successMessage?: string;
  redirectRoute: string;
  onSubmit: (values: TForm) => Promise<void>;
  FormDialog: React.ComponentType<GenericFormDialogProps<TForm>>;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export function AddEntityPage<TForm>({
  breadcrumbs,
  title,
  subtitle,
  successMessage,
  redirectRoute,
  onSubmit,
  FormDialog,
  maxWidth = 'lg',
}: AddEntityPageProps<TForm>) {
  const router = useRouter();
  const t = useTranslations();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleInternalSubmit = useCallback(async (values: TForm) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      
      if (successMessage) {
        setToast({ message: successMessage, severity: 'success' });
        timerRef.current = setTimeout(() => {
          router.push(redirectRoute);
        }, 1500);
      } else {
        router.push(redirectRoute);
      }
    } catch (err: any) {
      logger.error(`Failed to create entity for ${title}`, err);
      
      // Se for um erro de campo (ApiError), não mostramos toast, o Dialog deve tratar
      if (!err.fieldErrors) {
        setToast({ 
          message: err.message || t('common.messages.error'), 
          severity: 'error' 
        });
      }
      
      // Re-throw para o Dialog setar os fieldErrors via hook-form
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, successMessage, redirectRoute, router, title, t]);

  const handleClose = useCallback(() => {
    router.push(redirectRoute);
  }, [router, redirectRoute]);

  return (
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink underline="hover" href="/" display="flex" alignItems="center" gap={0.5} color="inherit">
            <HomeIcon fontSize="small" />
            {t('navigation.home')}
          </MuiLink>
          {breadcrumbs.map((item, index) => (
            item.href && !item.active ? (
              <MuiLink key={index} underline="hover" href={item.href} color="inherit" display="flex" alignItems="center" gap={0.5}>
                {item.icon}
                {item.label}
              </MuiLink>
            ) : (
              <Typography key={index} color="text.primary" display="flex" alignItems="center" gap={0.5}>
                {item.icon}
                {item.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
        
        <Typography variant="h4" fontWeight={800} gutterBottom>
           {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
           {subtitle}
        </Typography>
      </Box>

      <FormDialog
        open={true}
        isSubmitting={isSubmitting}
        onClose={handleClose}
        onSubmit={handleInternalSubmit}
      />

      <Snackbar 
        open={!!toast} 
        autoHideDuration={6000} 
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'info'} variant="filled" sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
