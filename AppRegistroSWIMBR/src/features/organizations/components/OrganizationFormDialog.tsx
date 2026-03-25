'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, Typography, IconButton,
  CircularProgress, Divider, InputAdornment, Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslations } from 'next-intl';

import type { Organization, OrganizationFormValues } from '@/features/contacts/types/organization.types';

interface OrganizationFormDialogProps {
  open: boolean;
  organization?: Organization | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: OrganizationFormValues) => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001';

export function OrganizationFormDialog({
  open,
  organization,
  isSubmitting,
  onClose,
  onSubmit,
}: OrganizationFormDialogProps) {
  const t = useTranslations('organizations');
  const isEditing = !!organization;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<OrganizationFormValues>({
    defaultValues: { name: '', acronym: '', description: '', logo: null },
  });

  const logoFile = watch('logo');

  useEffect(() => {
    if (open) {
      reset({
        name: organization?.name ?? '',
        acronym: organization?.acronym ?? '',
        description: organization?.description ?? '',
        logo: null,
      });
      setLogoPreview(
        organization?.logo_url
          ? `${API_BASE}${organization.logo_url}`
          : null
      );
    }
  }, [open, organization, reset]);

  useEffect(() => {
    if (logoFile instanceof File) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValue('logo', file);
  };

  const clearLogo = () => {
    setValue('logo', null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      PaperProps={{
        sx: { borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }
      }}
    >
      {/* ── Header Premium ── */}
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
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1.5, p: 1, display: 'flex' }}>
            {isEditing ? <SaveIcon /> : <BusinessIcon />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {isEditing ? organization?.name : t('newOrganization')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {isEditing ? t('messages.editSubtitle') : t('messages.addSubtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* ── Corpo do Formulário ── */}
      <DialogContent sx={{ px: { xs: 3, md: 5 }, pt: 4, pb: 6 }}>
        <Grid container spacing={4} sx={{ mt: 2 }}>

          {/* Nome */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: t('validation.nameRequired'), maxLength: { value: 255, message: t('validation.nameMax') } }}
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
                        <BusinessIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Sigla */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="acronym"
              control={control}
              rules={{ maxLength: { value: 20, message: t('validation.acronymMax') } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.acronymLabel')}
                  placeholder={t('form.acronymPlaceholder')}
                  fullWidth
                  error={!!errors.acronym}
                  helperText={errors.acronym?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Descrição */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              rules={{ maxLength: { value: 1000, message: t('validation.descriptionMax') } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.descriptionLabel')}
                  placeholder={t('form.descriptionPlaceholder')}
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionIcon color="primary" fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Logotipo */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              {t('form.logoLabel')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {t('form.logoHint')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={logoPreview ?? undefined}
                sx={{ width: 72, height: 72, bgcolor: 'action.hover', border: '2px dashed', borderColor: 'divider' }}
              >
                {!logoPreview && (
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ fontSize: 10 }}>
                    {t('form.noLogo')}
                  </Typography>
                )}
              </Avatar>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mr: 1, mb: 1 }}
                >
                  {t('form.chooseLogo')}
                </Button>
                {logoPreview && (
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={clearLogo}
                    sx={{ mb: 1 }}
                  >
                    {t('form.clearLogo')}
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  hidden
                  onChange={handleFileChange}
                />
              </Box>
            </Box>
          </Grid>

        </Grid>
      </DialogContent>

      {/* ── Ações ── */}
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
            borderRadius: 2, px: 5, py: 1.2, fontWeight: 700,
            boxShadow: (theme) => `0 4px 14px 0 ${theme.palette.mode === 'light' ? 'rgba(37,56,101,0.39)' : 'rgba(74,120,255,0.39)'}`,
            '&:hover': {
              boxShadow: (theme) => `0 6px 20px ${theme.palette.mode === 'light' ? 'rgba(37,56,101,0.23)' : 'rgba(74,120,255,0.23)'}`,
            },
          }}
        >
          {isSubmitting ? '...' : (isEditing ? t('messages.saveChanges') : t('messages.create'))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
