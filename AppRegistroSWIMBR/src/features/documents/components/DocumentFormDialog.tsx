'use client';

/**
 * Módulo: features/documents/components/DocumentFormDialog.tsx
 * Descrição: Dialog modal para criação e edição de documentos.
 *            Implementa React Hook Form + Zod e suporte a upload de arquivo.
 */

import { useEffect, useRef } from 'react';
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
  Chip,
} from '@mui/material';
import CloseIcon       from '@mui/icons-material/Close';
import UploadFileIcon  from '@mui/icons-material/UploadFile';
import SaveIcon        from '@mui/icons-material/Save';
import TitleIcon       from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon      from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TagIcon         from '@mui/icons-material/Tag';
import LanguageIcon    from '@mui/icons-material/Language';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { InputAdornment } from '@mui/material';

import { useTranslations } from 'next-intl';

import { useDocumentForm, type DocumentFormValues } from '../hooks/useDocumentForm';
import type { Document } from '../types/document.types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentFormDialogProps {
  open:        boolean;
  document?:   Document | null;
  isSubmitting: boolean;
  onClose:     () => void;
  onSubmit:    (values: DocumentFormValues) => Promise<void>;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function DocumentFormDialog({
  open,
  document,
  isSubmitting,
  onClose,
  onSubmit,
}: DocumentFormDialogProps) {
  const t = useTranslations('documents');
  const isEditing = !!document;
  const form = useDocumentForm(document ?? undefined);
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = form;

  const uploadedFile = watch('uploadfile');
  const inputRef     = useRef<HTMLInputElement>(null);

  // Reset do formulário quando o dialog abre/fecha
  useEffect(() => {
    if (open) {
      reset({
        title:       document?.title       ?? '',
        description: document?.description ?? '',
        publish:     document?.publish     ?? '',
        date_issued: document?.dateIssued  ?? document?.date_issued ?? '',
        version:     document?.version     ?? '',
        location:    document?.location    ?? '',
        uploadfile:  null,
      });
    }
  }, [open, document, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValue('uploadfile', file, { shouldValidate: true });
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
      {/* Cabeçalho Premium */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #696CFF 0%, #8082FF 100%)',
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
            {isEditing ? <SaveIcon /> : <CloudUploadIcon />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {isEditing ? `${document?.title} - v${document?.version}` : t('newDocument')}
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

      {/* Formulário com espaçamento superior corrigido */}
      <DialogContent sx={{ px: { xs: 3, md: 5 }, pt: 10, pb: 6 }}>
        <Grid container spacing={4} sx={{ mt: 2 }}>

          {/* Linha 1: Título e Versão */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`${t('labels.title')} *`}
                  placeholder={t('form.titlePlaceholder')}
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="version"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`${t('labels.version')} *`}
                  fullWidth
                  placeholder={t('form.versionPlaceholder')}
                  error={!!errors.version}
                  helperText={errors.version?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TagIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Linha 2: Publicador e Emissão */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Controller
              name="publish"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`${t('labels.publisher')} *`}
                  placeholder={t('form.publisherPlaceholder')}
                  fullWidth
                  error={!!errors.publish}
                  helperText={errors.publish?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="date_issued"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`${t('labels.date')} *`}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date_issued}
                  helperText={errors.date_issued?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Linha 3: Link Localização */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={`${t('labels.location')} *`}
                  fullWidth
                  placeholder={t('form.locationPlaceholder')}
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Linha 4: Descrição */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('labels.description')}
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

          {/* Linha 5: Upload de arquivo */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                border: '1.5px dashed',
                borderColor: uploadedFile ? 'primary.main' : 'divider',
                borderRadius: 3,
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                textAlign: { xs: 'center', sm: 'left' },
                gap: 3,
                bgcolor: uploadedFile ? 'rgba(105, 108, 255, 0.04)' : 'background.paper',
                cursor: 'pointer',
                transition: 'all .25s ease',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(105, 108, 255, 0.08)' },
              }}
              onClick={() => inputRef.current?.click()}
            >
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: '#fff',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  boxShadow: '0 4px 10px rgba(105, 108, 255, 0.25)',
                }}
              >
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
                  onDelete={(e) => { e.stopPropagation(); setValue('uploadfile', null); }}
                />
              )}

              {isEditing && document?.uploadfile && !uploadedFile && (
                <Typography variant="caption" sx={{ bgcolor: 'action.selected', px: 1.5, py: 0.5, borderRadius: 1 }}>
                  {t('form.upload.current', { name: String(document.uploadfile.name ?? t('actions.view')) })}
                </Typography>
              )}

              <input ref={inputRef} type="file" hidden onChange={handleFileChange} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Ações Modernizadas */}
      <DialogActions sx={{ px: { xs: 3, md: 5 }, py: 4, bgcolor: '#F9FAFB', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
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
            boxShadow: '0 4px 14px 0 rgba(105, 108, 255, 0.39)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(105, 108, 255, 0.23)',
            }
          }}
        >
          {isSubmitting ? t('messages.saving') : (isEditing ? t('messages.saveChanges') : t('messages.create'))}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
