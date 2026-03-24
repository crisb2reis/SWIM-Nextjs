'use client';

/**
 * Módulo: features/documents/components/DeleteConfirmDialog.tsx
 * Descrição: Dialog de confirmação de exclusão com feedback visual.
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslations } from 'next-intl';

interface DeleteConfirmDialogProps {
  open:         boolean;
  documentName: string;
  isDeleting:   boolean;
  onCancel:     () => void;
  onConfirm:    () => void;
}

export function DeleteConfirmDialog({
  open,
  documentName,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('documents');
  const a = useTranslations('actions');

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pt: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(239, 68, 68, 0.1)', // error.lighter
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          <WarningAmberIcon color="error" fontSize="large" />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {t('messages.confirmDelete')}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('messages.deleteWarning', { name: documentName })}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 1.5, px: 3, pb: 3 }}>
        <Button
          onClick={onCancel}
          disabled={isDeleting}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
        >
          {a('cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          variant="contained"
          color="error"
          startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100, fontWeight: 700 }}
        >
          {a('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
