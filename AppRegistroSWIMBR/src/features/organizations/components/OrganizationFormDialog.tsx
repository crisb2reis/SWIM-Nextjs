'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Grid,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Avatar,
  Chip,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
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
import { BaseFormDialog } from '@/components/common/BaseFormDialog';
import { FormField } from '@/components/common/FormField';
import { logger } from '@/lib/logger';

const TIPOS: OrganizationTipo[] = ['PROVEDOR', 'CONSUMIDOR', 'PARCEIRO', 'OUTRO'];
const STATUSES: OrganizationStatus[] = ['ATIVO', 'INATIVO', 'EM_APROVACAO'];

// ─── Estilos Extraídos ────────────────────────────────────────────────────────

const uploadAreaSx = (logoFile: File | null) => ({
  border: '1.5px dashed',
  borderColor: logoFile ? 'primary.main' : 'divider',
  borderRadius: 3,
  p: 3,
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: 'center',
  textAlign: { xs: 'center', sm: 'left' },
  gap: 3,
  bgcolor: logoFile
    ? (theme: Theme) =>
        theme.palette.mode === 'light'
          ? 'rgba(37, 56, 101, 0.04)'
          : 'rgba(74, 120, 255, 0.08)'
    : 'background.paper',
  cursor: 'pointer',
  transition: 'all .25s ease',
  '&:hover': {
    borderColor: 'primary.main',
    bgcolor: (theme: Theme) =>
      theme.palette.mode === 'light'
        ? 'rgba(37, 56, 101, 0.08)'
        : 'rgba(74, 120, 255, 0.12)',
  },
} as const);

const avatarSx = {
  width: 56,
  height: 56,
  bgcolor: 'primary.main',
  color: '#fff',
  boxShadow: (theme: Theme) =>
    `0 4px 10px ${
      theme.palette.mode === 'light'
        ? 'rgba(37, 56, 101, 0.25)'
        : 'rgba(74, 120, 255, 0.25)'
    }`,
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  organization?: Organization | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: OrganizationFormValues) => Promise<void>;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function OrganizationFormDialog({
  open,
  organization,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations('organizations');
  const commonT = useTranslations('common');
  const actionT = useTranslations('actions');
  const isEditing = !!organization;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    defaultValues: {
      name: '',
      acronym: '',
      description: '',
      tipo: 'OUTRO',
      status: 'ATIVO',
      logo: null,
    },
  });

  const logoFile = watch('logo');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

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
        organization?.logo_url ? `${BASE_URL}${organization.logo_url}` : null
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
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError('logo', { message: t('validation.logoType') });
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError('logo', { message: t('validation.logoMax') });
        return;
      }
      setValue('logo', file, { shouldValidate: true });
    }
  };

  const onInternalSubmit = useCallback(
    handleSubmit(
      async (values: OrganizationFormValues) => {
        try {
          await onSubmit(values);
        } catch (err: any) {
          if (err.fieldErrors) {
            type OrgField = keyof OrganizationFormValues;
            const knownFields = new Set<OrgField>(['name', 'acronym', 'description', 'tipo', 'status', 'logo']);

            err.fieldErrors.forEach((fe: { field: string; message: string }) => {
              if (knownFields.has(fe.field as OrgField)) {
                setError(fe.field as OrgField, { type: 'manual', message: fe.message });
              } else {
                setError('root', { message: fe.message });
              }
            });
          } else {
            // Erro global caso não seja array de campos
            setError('root', {
              message: t('messages.submitError') || commonT('messages.error'),
            });
          }
        }
      },
      (validationErrors) => {
        logger.error('Falha na validação do formulário de Organização', null, {
          event_type: 'FRONTEND_VALIDATION_ERROR',
          action: isEditing ? 'UPDATE_ORG_VALIDATION' : 'CREATE_ORG_VALIDATION',
          metadata: {
            invalidFields: Object.keys(validationErrors),
            errors: Object.entries(validationErrors).map(([field, err]) => ({
              field,
              message: err?.message,
              type: err?.type,
            })),
          },
        });
      },
    ),
    [handleSubmit, onSubmit, setError, t, isEditing, commonT],
  );

  return (
    <BaseFormDialog
      open={open}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onClose={onClose}
      onSave={onInternalSubmit}
      icon={isEditing ? <SaveIcon /> : <BusinessIcon />}
      title={isEditing ? (organization?.name ?? '') : t('newOrganization')}
      subtitle={isEditing ? t('messages.editSubtitle') : t('messages.addSubtitle')}
      discardLabel={actionT('cancel')}
      saveLabel={isEditing ? actionT('save') : actionT('confirm')}
      savingLabel={commonT('loading')}
      dialogId="organization-form-dialog"
    >
      {errors.root && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.root.message}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Nome e Sigla */}
        <Grid size={{ xs: 12, md: 8 }}>
          <FormField
            name="name"
            control={control}
            rules={{ required: t('validation.nameRequired') }}
            label={`${t('form.nameLabel')} *`}
            placeholder={t('form.namePlaceholder')}
            icon={<BusinessIcon />}
            error={errors.name}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormField
            name="acronym"
            control={control}
            label={t('form.acronymLabel')}
            placeholder={t('form.acronymPlaceholder')}
            icon={<BadgeIcon />}
            error={errors.acronym}
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
                    <MenuItem key={v} value={v}>
                      {t(`tipo.${v}`)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipo && (
                  <FormHelperText>{errors.tipo.message}</FormHelperText>
                )}
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
                    <MenuItem key={v} value={v}>
                      {t(`status.${v}`)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Descrição */}
        <Grid size={{ xs: 12 }}>
          <FormField
            name="description"
            control={control}
            label={t('form.descriptionLabel')}
            placeholder={t('form.descriptionPlaceholder')}
            icon={<DescriptionIcon />}
            error={errors.description}
            slotProps={{ multiline: true, rows: 2 }}
            adornmentSx={{ alignSelf: 'flex-start', mt: 1.5 }}
          />
        </Grid>

        {/* Logotipo (Upload) */}
        <Grid size={{ xs: 12 }}>
          <Box sx={uploadAreaSx(logoFile)} onClick={() => fileInputRef.current?.click()}>
            <Avatar src={logoPreview ?? undefined} variant="rounded" sx={avatarSx}>
              {!logoPreview && <CloudUploadIcon />}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {logoFile ? t('form.logoLabel') : t('form.chooseLogo')}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {logoFile
                  ? logoFile.name
                  : t('form.logoHint') || 'Clique para selecionar o logotipo (máx 2MB)'}
              </Typography>
              {errors.logo && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                  {errors.logo.message}
                </Typography>
              )}
            </Box>

            {logoFile && (
              <Chip
                label={`${(logoFile.size / 1024).toFixed(1)} KB`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={(e) => {
                  e.stopPropagation();
                  setValue('logo', null, { shouldValidate: true });
                  setLogoPreview(
                    organization?.logo_url
                      ? `${BASE_URL}${organization.logo_url}`
                      : null
                  );
                }}
              />
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
              key={logoFile ? logoFile.name : 'empty'}
            />
          </Box>
        </Grid>
      </Grid>
    </BaseFormDialog>
  );
}
