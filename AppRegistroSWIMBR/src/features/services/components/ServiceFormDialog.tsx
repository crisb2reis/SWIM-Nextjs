'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, Typography, IconButton,
  CircularProgress, MenuItem, Select, FormControl,
  InputLabel, FormHelperText, Divider, InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

// Opções dos selects
const STATUSES: ServiceStatus[]              = ['EM_APROVACAO', 'ATIVO', 'INATIVO', 'SUSPENSO'];
const LIFE_CYCLES: ServiceLifeCycle[]        = ['PROPOSTA', 'CANDIDATO', 'OPERACIONAL', 'LEGADO', 'RETIRADO'];
const TIPOS: ServiceTipo[]                   = ['REST', 'SOAP', 'FTP', 'AMHS', 'OUTRO'];
const PUBLISH_STATUSES: ServicePublishStatus[] = ['PUBLICADO', 'RASCUNHO', 'INATIVO'];

interface Props {
  open: boolean;
  service?: Service | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
}

export function ServiceFormDialog({
  open, service, isSubmitting, onClose, onSubmit,
}: Props) {
  const t = useTranslations('services');
  const isEditing = !!service;

  const {
    control, handleSubmit, reset, setError,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    defaultValues: {
      name:           '',
      organization:   '',
      version:        '',
      status:         'EM_APROVACAO',
      life_cycle:     'PROPOSTA',
      tipo:           'OUTRO',
      publish_status: 'RASCUNHO',
    },
  });

  // Reset ao abrir / trocar serviço
  useEffect(() => {
    if (open) {
      reset({
        name:           service?.name           ?? '',
        organization:   service?.organization   ?? '',
        version:        service?.version        ?? '',
        status:         service?.status         ?? 'EM_APROVACAO',
        life_cycle:     service?.life_cycle     ?? 'PROPOSTA',
        tipo:           service?.tipo           ?? 'OUTRO',
        publish_status: service?.publish_status ?? 'RASCUNHO',
      });
    }
  }, [open, service, reset]);

  const onInternalSubmit = async (values: ServiceFormValues) => {
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
             {isEditing ? <SaveIcon /> : <MiscellaneousServicesIcon />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {isEditing ? service?.name : t('newService')}
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
          
          {/* Nome do Serviço */}
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
                        <MiscellaneousServicesIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Versão */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="version"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.versionLabel')}
                  placeholder={t('form.versionPlaceholder')}
                  fullWidth
                  error={!!errors.version}
                  helperText={errors.version?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HistoryIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Organização */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="organization"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('form.organizationLabel')}
                  placeholder={t('form.organizationPlaceholder')}
                  fullWidth
                  error={!!errors.organization}
                  helperText={errors.organization?.message}
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
                      <MenuItem key={v} value={v}>{t(`status.${v}`)}</MenuItem>
                    ))}
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
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
                      <MenuItem key={v} value={v}>{t(`lifeCycle.${v}`)}</MenuItem>
                    ))}
                  </Select>
                  {errors.life_cycle && <FormHelperText>{errors.life_cycle.message}</FormHelperText>}
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
                      <MenuItem key={v} value={v}>{t(`tipo.${v}`)}</MenuItem>
                    ))}
                  </Select>
                  {errors.tipo && <FormHelperText>{errors.tipo.message}</FormHelperText>}
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
                      <MenuItem key={v} value={v}>{t(`publishStatus.${v}`)}</MenuItem>
                    ))}
                  </Select>
                  {errors.publish_status && <FormHelperText>{errors.publish_status.message}</FormHelperText>}
                </FormControl>
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
