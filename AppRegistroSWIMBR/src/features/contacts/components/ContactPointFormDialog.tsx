'use client';

import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import PhoneIcon from '@mui/icons-material/Phone';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { useTranslations } from 'next-intl';

import { useContactPointForm, type ContactPointFormValues } from '../hooks/useContactPointForm';
import type { ContactPoint } from '../types/contact.types';
import type { Organization } from '@/features/organizations/types/organization.types';

interface ContactPointFormDialogProps {
  open: boolean;
  contact?: ContactPoint | null;
  organizations: Organization[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ContactPointFormValues) => Promise<void>;
}

export function ContactPointFormDialog({
  open,
  contact,
  organizations,
  isSubmitting,
  onClose,
  onSubmit,
}: ContactPointFormDialogProps) {
  const t = useTranslations('contacts');
  const isEditing = !!contact;
  const form = useContactPointForm(contact ?? undefined);
  const { control, handleSubmit, reset, formState: { errors } } = form;

  useEffect(() => {
    if (open) {
      reset({
        name: contact?.name ?? '',
        email: contact?.email ?? '',
        role: contact?.role ?? '',
        phone: contact?.phone ?? '',
        organization_id: contact?.organization_id ?? 0,
      });
    }
  }, [open, contact, reset]);

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #253865 0%, #80879e 100%)',
          color: '#fff',
          py: 4,
          px: { xs: 3, md: 5 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 1.5,
              p: 1,
              display: 'flex'
            }}
          >
            {isEditing ? <SaveIcon /> : <PersonIcon />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {isEditing ? contact?.name : t('newContact')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {isEditing ? t('messages.editSubtitle') : t('messages.addSubtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: 'inherit',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 6 }}>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.nameLabel') + ' *'}
                  placeholder={t('form.namePlaceholder')}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.emailLabel') + ' *'}
                  placeholder={t('form.emailPlaceholder')}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.roleLabel')}
                  placeholder={t('form.rolePlaceholder')}
                  fullWidth
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.phoneLabel')}
                  placeholder={t('form.phonePlaceholder')}
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="organization_id"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Autocomplete
                  options={organizations}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, val) => option.id === (typeof val === 'number' ? val : val?.id)}
                  value={organizations.find(o => o.id === value) || null}
                  onChange={(_, newValue) => onChange(newValue?.id ?? 0)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('form.organizationLabel') + ' *'}
                      placeholder={t('form.organizationPlaceholder')}
                      error={!!errors.organization_id}
                      helperText={errors.organization_id?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <CorporateFareIcon color="primary" fontSize="small" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, md: 5 }, py: 4, bgcolor: 'background.default', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="text"
          color="inherit"
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          {t('messages.discard')}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSubmit(onSubmit)}
          sx={{
            borderRadius: 2,
            px: 5,
            py: 1.2,
            fontWeight: 700,
            boxShadow: (theme) => `0 4px 14px 0 ${theme.palette.mode === 'light' ? 'rgba(37, 56, 101, 0.39)' : 'rgba(74, 120, 255, 0.39)'}`,
            '&:hover': {
              boxShadow: (theme) => `0 6px 20px ${theme.palette.mode === 'light' ? 'rgba(37, 56, 101, 0.23)' : 'rgba(74, 120, 255, 0.23)'}`,
            }
          }}
        >
          {isSubmitting ? '...' : (isEditing ? t('messages.saveChanges') : t('messages.create'))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
