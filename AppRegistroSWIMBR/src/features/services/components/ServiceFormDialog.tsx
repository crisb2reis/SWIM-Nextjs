'use client';

import { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import HistoryIcon from '@mui/icons-material/History';
import InfoIcon from '@mui/icons-material/Info';
import TimelineIcon from '@mui/icons-material/Timeline';
import CategoryIcon from '@mui/icons-material/Category';
import PublicIcon from '@mui/icons-material/Public';
import { useTranslations } from 'next-intl';

import type {
  Service,
  ServiceFormValues,
  ServiceStatus,
  ServiceLifeCycle,
  ServiceTipo,
  ServicePublishStatus,
} from '../types/service.types';

import { BaseFormDialog } from '@/components/common/BaseFormDialog';
import { FormField } from '@/components/common/FormField';

// Opções dos selects
const STATUSES: ServiceStatus[] = ['EM_APROVACAO', 'ATIVO', 'INATIVO', 'SUSPENSO'];
const LIFE_CYCLES: ServiceLifeCycle[] = [
  'PROPOSTA',
  'CANDIDATO',
  'OPERACIONAL',
  'LEGADO',
  'RETIRADO',
];
const TIPOS: ServiceTipo[] = ['REST', 'SOAP', 'FTP', 'AMHS', 'OUTRO'];
const PUBLISH_STATUSES: ServicePublishStatus[] = [
  'PUBLICADO',
  'RASCUNHO',
  'INATIVO',
];

interface Props {
  open: boolean;
  service?: Service | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
}

export function ServiceFormDialog({
  open,
  service,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations('services');
  const commonT = useTranslations('common');
  const isEditing = !!service;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    defaultValues: {
      name: '',
      organization: '',
      version: '',
      status: 'EM_APROVACAO',
      life_cycle: 'PROPOSTA',
      tipo: 'OUTRO',
      publish_status: 'RASCUNHO',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: service?.name ?? '',
        organization: service?.organization ?? '',
        version: service?.version ?? '',
        status: service?.status ?? 'EM_APROVACAO',
        life_cycle: service?.life_cycle ?? 'PROPOSTA',
        tipo: service?.tipo ?? 'OUTRO',
        publish_status: service?.publish_status ?? 'RASCUNHO',
      });
    }
  }, [open, service, reset]);

  const onInternalSubmit = useCallback(
    handleSubmit(async (values: ServiceFormValues) => {
      try {
        await onSubmit(values);
      } catch (err: any) {
        if (err.fieldErrors) {
          err.fieldErrors.forEach((fe: { field: string; message: string }) => {
            // @ts-ignore
            setError(fe.field, { type: 'manual', message: fe.message });
          });
        } else {
          setError('root', { message: t('messages.submitError') || 'Erro ao enviar dados.' });
        }
      }
    }),
    [handleSubmit, onSubmit, setError, t],
  );

  return (
    <BaseFormDialog
      open={open}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onClose={onClose}
      onSave={onInternalSubmit}
      icon={isEditing ? <SaveIcon /> : <MiscellaneousServicesIcon />}
      title={isEditing ? (service?.name ?? '') : t('newService')}
      subtitle={isEditing ? t('messages.editSubtitle') : t('messages.addSubtitle')}
      discardLabel={t('messages.discard') || commonT('discard')}
      saveLabel={isEditing ? t('messages.saveChanges') : t('messages.create')}
      savingLabel={t('messages.saving')}
      dialogId="service-form-dialog"
    >
      {errors.root && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.root.message}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Nome do Serviço */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: t('validation.nameRequired') }}
            render={({ field }) => (
              <FormField
                name={field.name}
                control={control}
                label={`${t('form.nameLabel')} *`}
                placeholder={t('form.namePlaceholder')}
                icon={<MiscellaneousServicesIcon />}
                error={errors.name}
              />
            )}
          />
        </Grid>

        {/* Versão */}
        <Grid size={{ xs: 12, md: 4 }}>
          <FormField
            name="version"
            control={control}
            label={t('form.versionLabel')}
            placeholder={t('form.versionPlaceholder')}
            icon={<HistoryIcon />}
            error={errors.version}
          />
        </Grid>

        {/* Organização */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="organization"
            control={control}
            label={t('form.organizationLabel')}
            placeholder={t('form.organizationPlaceholder')}
            icon={<BusinessIcon />}
            error={errors.organization}
          />
        </Grid>

        {/* Status do Serviço */}
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

        {/* Ciclo de Vida */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="life_cycle"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.life_cycle}>
                <InputLabel>{`${t('form.lifeCycleLabel')} *`}</InputLabel>
                <Select
                  {...field}
                  label={`${t('form.lifeCycleLabel')} *`}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <TimelineIcon fontSize="small" color="primary" />
                    </InputAdornment>
                  }
                >
                  {LIFE_CYCLES.map((v) => (
                    <MenuItem key={v} value={v}>
                      {t(`lifeCycle.${v}`)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.life_cycle && (
                  <FormHelperText>{errors.life_cycle.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Tipo do Serviço */}
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

        {/* Status da Publicação */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="publish_status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.publish_status}>
                <InputLabel>{`${t('form.publishStatusLabel')} *`}</InputLabel>
                <Select
                  {...field}
                  label={`${t('form.publishStatusLabel')} *`}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <PublicIcon fontSize="small" color="primary" />
                    </InputAdornment>
                  }
                >
                  {PUBLISH_STATUSES.map((v) => (
                    <MenuItem key={v} value={v}>
                      {t(`publishStatus.${v}`)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.publish_status && (
                  <FormHelperText>{errors.publish_status.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </BaseFormDialog>
  );
}
