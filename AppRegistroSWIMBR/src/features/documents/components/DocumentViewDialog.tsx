'use client';

/**
 * Módulo: features/documents/components/DocumentViewDialog.tsx
 * Descrição: Dialog de visualização detalhada de um documento (somente leitura).
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  IconButton,
  Link,
  useTheme,
} from '@mui/material';
import CloseIcon          from '@mui/icons-material/Close';
import CalendarTodayIcon  from '@mui/icons-material/CalendarToday';
import BusinessIcon       from '@mui/icons-material/Business';
import TagIcon            from '@mui/icons-material/Tag';
import LinkIcon           from '@mui/icons-material/Link';
import DownloadIcon       from '@mui/icons-material/Download';
import DescriptionIcon    from '@mui/icons-material/Description';

import { useTranslations } from 'next-intl';

import type { Document } from '../types/document.types';
import { documentService } from '../services/documentService';

interface DocumentViewDialogProps {
  open:     boolean;
  document: Document | null;
  onClose:  () => void;
  onEdit?:   (doc: Document) => void;
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box display="flex" gap={1.5} alignItems="flex-start" sx={{ py: 0.5 }}>
      <Box color="primary.main" mt={0.2}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

export function DocumentViewDialog({
  open,
  document,
  onClose,
  onEdit,
}: DocumentViewDialogProps) {
  const t = useTranslations('documents');
  const a = useTranslations('actions');
  const theme = useTheme();

  const handleDownload = async () => {
    if (!document?.uploadfile?.file) return;
    const filename = String(document.uploadfile.name || document.uploadfile.file).split('/').pop() ?? '';
    try {
      const blob = await documentService.download(document.id);
      const url  = window.URL.createObjectURL(blob);
      const docEl    = window.document.createElement('a');
      docEl.href     = url;
      docEl.download = filename;
      window.document.body.appendChild(docEl);
      docEl.click();
      docEl.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // silently fail — toast handled by parent if needed
    }
  };

  if (!document) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <DescriptionIcon />
          <Typography variant="h6" fontWeight={700} noWrap>
            {document.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'inherit' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2}>
          {/* Versão badge */}
          {document.version && (
            <Box>
              <Chip
                label={`v${document.version}`}
                color="primary"
                size="small"
                icon={<TagIcon />}
                sx={{ fontWeight: 700 }}
              />
            </Box>
          )}

          {/* Campos estruturados */}
          <Stack spacing={1} divider={<Divider flexItem />}>
            {document.publish && (
              <InfoRow icon={<BusinessIcon fontSize="small" />} label={t('labels.publisher')}>
                {document.publish}
              </InfoRow>
            )}
            {(document.dateIssued || document.date_issued) && (
              <InfoRow icon={<CalendarTodayIcon fontSize="small" />} label={t('labels.date')}>
                {document.dateIssued ?? document.date_issued}
              </InfoRow>
            )}
            {document.location && (
              <InfoRow icon={<LinkIcon fontSize="small" />} label={t('labels.location')}>
                <Link href={document.location} target="_blank" rel="noopener noreferrer">
                  {document.location}
                </Link>
              </InfoRow>
            )}
          </Stack>

          {/* Descrição */}
          {document.description && (
            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[50],
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                {t('labels.description')}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {document.description}
              </Typography>
            </Box>
          )}

          {/* Arquivo */}
          {document.uploadfile && (
            <Box display="flex" alignItems="center" gap={1}>
              <DownloadIcon fontSize="small" color="action" />
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={handleDownload}
              >
                {String(document.uploadfile.file ?? '').split('/').pop() ?? t('labels.file')}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          {a('close')}
        </Button>
        {onEdit && (
          <Button
            variant="contained"
            onClick={() => { onClose(); onEdit(document); }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            {a('edit')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
