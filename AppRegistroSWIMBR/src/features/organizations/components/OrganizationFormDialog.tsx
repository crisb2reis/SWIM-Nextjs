'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, Typography, IconButton,
  CircularProgress, MenuItem, Select, FormControl,
  InputLabel, FormHelperText, Avatar, Divider, Chip,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslations } from 'next-intl';

import type {
  Organization,
  OrganizationFormValues,
  OrganizationTipo,
  OrganizationStatus,
} from '../types/organization.types';

import { BASE_URL } from '@/lib/axios';
const API_BASE = BASE_URL;

const TIPOS: OrganizationTipo[] = ['PROVEDOR', 'CONSUMIDOR', 'PARCEIRO', 'OUTRO'];
const STATUSES: OrganizationStatus[] = ['ATIVO', 'INATIVO', 'EM_APROVACAO'];

interface Props {
  open: boolean;
  organization?: Organization | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: OrganizationFormValues) => Promise<void>;
}

export function OrganizationFormDialog({
  open, organization, isSubmitting, onClose, onSubmit,
}: Props) {
  const t = useTranslations('organizations');
  const isEditing = !!organization;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    control, handleSubmit, reset, setValue, watch, setError,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    defaultValues: {
      name: '', acronym: '', description: '',
      tipo: 'OUTRO', status: 'ATIVO', logo: null,
    },
  });

  const logoFile = watch('logo');

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      reset({
        name: organization?.name ?? '',
        acronym: organization?.acronym ?? '',
        description: organization?.description ?? '',
        tipo: organization?.tipo ?? 'OUTRO',
        status: organization?.status ?? 'ATIVO',
        logo: null,
      });
      setLogoPreview(
        organization?.logo_url ? `${API_BASE}${organization.logo_url}` : null
      );
    }
  }, [open, organization, reset]);

  // Preview do logo
  useEffect(() => {
    if (logoFile instanceof File) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t('validation.logoMax') || 'Arquivo muito grande (máx 2MB)');
        return;
      }
      setValue('logo', file, { shouldValidate: true });
    }
  };

  const onInternalSubmit = async (values: OrganizationFormValues) => {
    try {
      await onSubmit(values);
    } catch (err: any) {
      if (err.fieldErrors) {
        err.fieldErrors.forEach((fe: { field: string; message: string }) => {
          // @ts-ignore
          setError(fe.field, { type: 'manual', message: fe.message });
        });
      }
    }
  };

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
      {/* Cabeçalho Premium - Estilo DocumentFormDialog */}
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
          
          {/* Nome e Sigla */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: t('validation.nameRequired') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`${t('form.nameLabel')} *`}
                  placeholder={t('form.namePlaceholder')}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="acronym"
              control={control}
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
                        <BadgeIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Tipo e Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>{`${t('form.tipoLabel')} *`}</InputLabel>
                  <Select
                    {...field}
                    label={`${t('form.tipoLabel')} *`}
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <CategoryIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    }
                  >
                    {TIPOS.map((v) => (
                      <MenuItem key={v} value={v}>{t(`tipo.${v}`)}</MenuItem>
                    ))}
                  </Select>
                  {errors.tipo && <FormHelperText>{errors.tipo.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>{`${t('form.statusLabel')} *`}</InputLabel>
                  <Select
                    {...field}
                    label={`${t('form.statusLabel')} *`}
                    startAdornment={
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <InfoIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    }
                  >
                    {STATUSES.map((v) => (
                      <MenuItem key={v} value={v}>{t(`status.${v}`)}</MenuItem>
                    ))}
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          {/* Descrição */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.descriptionLabel')}
                  placeholder={t('form.descriptionPlaceholder')}
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Logotipo (Upload Estilo Documento) */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                border: '1.5px dashed',
                borderColor: logoFile ? 'primary.main' : 'divider',
                borderRadius: 3,
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                textAlign: { xs: 'center', sm: 'left' },
                gap: 3,
                bgcolor: logoFile ? (theme) => theme.palette.mode === 'light' ? 'rgba(37, 56, 101, 0.04)' : 'rgba(74, 120, 255, 0.08)' : 'background.paper',
                cursor: 'pointer',
                transition: 'all .25s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(37, 56, 101, 0.08)' : 'rgba(74, 120, 255, 0.12)'
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar
                src={logoPreview ?? undefined}
                variant="rounded"
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  boxShadow: (theme) => `0 4px 10px ${theme.palette.mode === 'light' ? 'rgba(37, 56, 101, 0.25)' : 'rgba(74, 120, 255, 0.25)'}`,
                }}
              >
                {!logoPreview && <CloudUploadIcon />}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {logoFile ? t('form.logoLabel') : t('form.chooseLogo')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {logoFile
                    ? logoFile.name
                    : t('form.logoHint') || 'Clique para selecionar o logotipo (máx 2MB)'}
                </Typography>
              </Box>

              {logoFile && (
                <Chip
                  label={`${(logoFile.size / 1024).toFixed(1)} KB`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onDelete={(e) => { e.stopPropagation(); setValue('logo', null); setLogoPreview(organization?.logo_url ? `${API_BASE}${organization.logo_url}` : null); }}
                />
              )}

              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
            </Box>
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
          onClick={handleSubmit(onInternalSubmit)}
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
