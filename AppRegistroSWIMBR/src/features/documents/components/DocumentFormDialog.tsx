'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import {
  Grid,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TagIcon from '@mui/icons-material/Tag';
import LanguageIcon from '@mui/icons-material/Language';

import { useTranslations } from 'next-intl';

import { useDocumentForm, type DocumentFormValues } from '../hooks/useDocumentForm';
import type { Document } from '../types/document.types';
import { BaseFormDialog } from '@/components/common/BaseFormDialog';
import { FormField } from '@/components/common/FormField';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentFormDialogProps {
  open: boolean;
  document?: Document | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: DocumentFormValues) => Promise<void>;
}

// ─── Estilos Extraídos ────────────────────────────────────────────────────────

const uploadAreaSx = (uploadedFile: File | null) => ({
  border: '1.5px dashed',
  borderColor: uploadedFile ? 'primary.main' : 'divider',
  borderRadius: 3,
  p: 3,
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: 'center',
  textAlign: { xs: 'center', sm: 'left' },
  gap: 3,
  bgcolor: uploadedFile
    ? (theme: any) =>
        theme.palette.mode === 'light'
          ? 'rgba(37, 56, 101, 0.04)'
          : 'rgba(74, 120, 255, 0.08)'
    : 'background.paper',
  cursor: 'pointer',
  transition: 'all .25s ease',
  '&:hover': {
    borderColor: 'primary.main',
    bgcolor: (theme: any) =>
      theme.palette.mode === 'light'
        ? 'rgba(37, 56, 101, 0.08)'
        : 'rgba(74, 120, 255, 0.12)',
  },
} as const);

const uploadIconWrapSx = {
  bgcolor: 'primary.main',
  color: '#fff',
  borderRadius: 2,
  p: 1.5,
  display: 'flex',
  boxShadow: (theme: any) =>
    `0 4px 10px ${
      theme.palette.mode === 'light'
        ? 'rgba(37, 56, 101, 0.25)'
        : 'rgba(74, 120, 255, 0.25)'
    }`,
} as const;

// ─── Componente ───────────────────────────────────────────────────────────────

export function DocumentFormDialog({
  open,
  document,
  isSubmitting,
  onClose,
  onSubmit,
}: DocumentFormDialogProps) {
  const t = useTranslations('documents');
  const commonT = useTranslations('common');
  const isEditing = !!document;

  const { control, handleSubmit, reset, setValue, watch, setError, formState: { errors } } =
    useDocumentForm(document ?? undefined);

  const uploadedFile = watch('uploadfile');
  const inputRef = useRef<HTMLInputElement>(null);

  // O reset aqui precisa ser mantido num caso específico: 
  // O DocumentFormDialog pode ser reaberto sem desmontar. 
  // No entanto, podemos forçar o remount via `key` externamente ao chamar o dialog,
  // mas para garantir (como o uploadfile não é padrão de texto simples), deixamos um effect
  // focado apenas em resetar tudo quando `open` muda E mantemos os dados do documento.
  useEffect(() => {
    if (open) {
      reset({
        title: document?.title ?? '',
        description: document?.description ?? '',
        publish: document?.publish ?? '',
        date_issued: document?.dateIssued ?? document?.date_issued ?? '',
        version: document?.version ?? '',
        location: document?.location ?? '',
        uploadfile: null,
      });
    }
  }, [open, document, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValue('uploadfile', file, { shouldValidate: true });
  };

  const handleSave = useCallback(
    handleSubmit(async (values) => {
      try {
        await onSubmit(values);
      } catch (err) {
        setError('root', { message: t('messages.submitError') || 'Erro ao enviar os dados.' });
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
      onSave={handleSave}
      icon={isEditing ? <SaveIcon /> : <CloudUploadIcon />}
      title={isEditing ? `${document?.title} - v${document?.version}` : t('newDocument')}
      subtitle={isEditing ? t('messages.editSubtitle') : t('messages.addSubtitle')}
      discardLabel={t('messages.discard') || commonT('discard')}
      saveLabel={isEditing ? t('messages.saveChanges') : t('messages.create')}
      savingLabel={t('messages.saving')}
      dialogId="document-form-dialog"
    >
      {errors.root && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.root.message}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Linha 1: Título e Versão */}
        <Grid size={{ xs: 12, md: 8 }}>
          <FormField
            name="title"
            control={control}
            label={`${t('labels.title')} *`}
            placeholder={t('form.titlePlaceholder')}
            icon={<TitleIcon />}
            error={errors.title}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormField
            name="version"
            control={control}
            label={`${t('labels.version')} *`}
            placeholder={t('form.versionPlaceholder')}
            icon={<TagIcon />}
            error={errors.version}
          />
        </Grid>

        {/* Linha 2: Publicador e Emissão */}
        <Grid size={{ xs: 12, md: 8 }}>
          <FormField
            name="publish"
            control={control}
            label={`${t('labels.publisher')} *`}
            placeholder={t('form.publisherPlaceholder')}
            icon={<PersonIcon />}
            error={errors.publish}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormField
            name="date_issued"
            control={control}
            label={`${t('labels.date')} *`}
            icon={<CalendarMonthIcon />}
            error={errors.date_issued}
            slotProps={{ type: 'date', InputLabelProps: { shrink: true } }}
          />
        </Grid>

        {/* Linha 3: Link Localização */}
        <Grid size={{ xs: 12 }}>
          <FormField
            name="location"
            control={control}
            label={`${t('labels.location')} *`}
            placeholder={t('form.locationPlaceholder')}
            icon={<LanguageIcon />}
            error={errors.location}
          />
        </Grid>

        {/* Linha 4: Descrição */}
        <Grid size={{ xs: 12 }}>
          <FormField
            name="description"
            control={control}
            label={t('labels.description')}
            placeholder={t('form.descriptionPlaceholder')}
            icon={<DescriptionIcon />}
            error={errors.description}
            slotProps={{ multiline: true, rows: 2 }}
            adornmentSx={{ alignSelf: 'flex-start', mt: 1.5 }}
          />
        </Grid>

        {/* Linha 5: Upload de arquivo */}
        <Grid size={{ xs: 12 }}>
          <Box sx={uploadAreaSx(uploadedFile ?? null)} onClick={() => inputRef.current?.click()}>
            <Box sx={uploadIconWrapSx}>
              <CloudUploadIcon />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {uploadedFile ? t('form.upload.ready') : t('form.upload.title')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {uploadedFile
                  ? t('form.upload.saveReady', { name: uploadedFile.name })
                  : t('form.upload.clickToSearch')}
              </Typography>
            </Box>

            {uploadedFile && (
              <Chip
                label={`${(uploadedFile.size / 1024).toFixed(1)} KB`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={(e) => {
                  e.stopPropagation();
                  setValue('uploadfile', null, { shouldValidate: true });
                }}
              />
            )}

            {isEditing && document?.uploadfile && !uploadedFile && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'action.selected',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {t('form.upload.current', {
                  name: String(document.uploadfile.name ?? t('messages.view')),
                })}
              </Typography>
            )}

            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={handleFileChange}
              // Add a key so that we can reset the input if required
              key={uploadedFile ? uploadedFile.name : 'empty'}
            />
          </Box>
        </Grid>
      </Grid>
    </BaseFormDialog>
  );
}
