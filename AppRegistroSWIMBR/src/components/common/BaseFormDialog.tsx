'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

// ─── Tokens de estilo estáveis (fora do componente = sem re-criação) ──────────

const paperSx = {
  borderRadius: 4,
  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
} as const;

const titleSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'linear-gradient(135deg, #253865 0%, #80879e 100%)',
  color: '#fff',
  py: 4,
  px: { xs: 3, md: 5 },
} as const;

const iconWrapSx = {
  backgroundColor: 'rgba(255,255,255,0.2)',
  borderRadius: 1.5,
  p: 1,
  display: 'flex',
} as const;

const closeButtonSx = {
  color: 'inherit',
  bgcolor: 'rgba(255,255,255,0.1)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
} as const;

const contentSx = {
  px: { xs: 3, md: 5 },
  pt: 4,
  pb: 6,
} as const;

const actionsSx = {
  px: { xs: 3, md: 5 },
  py: 4,
  bgcolor: 'background.default',
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
} as const;

const discardBtnSx = {
  borderRadius: 2,
  px: 3,
  fontWeight: 600,
} as const;

const saveBtnSx = {
  borderRadius: 2,
  px: 5,
  py: 1.2,
  fontWeight: 700,
  boxShadow: (theme: { palette: { mode: string } }) =>
    `0 4px 14px 0 ${
      theme.palette.mode === 'light'
        ? 'rgba(37, 56, 101, 0.39)'
        : 'rgba(74, 120, 255, 0.39)'
    }`,
  '&:hover': {
    boxShadow: (theme: { palette: { mode: string } }) =>
      `0 6px 20px ${
        theme.palette.mode === 'light'
          ? 'rgba(37, 56, 101, 0.23)'
          : 'rgba(74, 120, 255, 0.23)'
      }`,
  },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BaseFormDialogProps {
  open: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSave: () => void;
  /** Ícone exibido no cabeçalho */
  icon: React.ReactNode;
  /** Título principal no cabeçalho */
  title: string;
  /** Subtítulo/legenda no cabeçalho */
  subtitle: string;
  /** Label do botão Descartar */
  discardLabel: string;
  /** Label do botão Salvar (estado normal) */
  saveLabel: string;
  /** Label do botão Salvar (estado enviando) */
  savingLabel?: string;
  /** Campos e conteúdo do formulário */
  children: React.ReactNode;
  /** Prefixo dos IDs de acessibilidade */
  dialogId?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function BaseFormDialog({
  open,
  isSubmitting,
  onClose,
  onSave,
  icon,
  title,
  subtitle,
  discardLabel,
  saveLabel,
  savingLabel = '...',
  children,
  dialogId = 'base-form-dialog',
}: BaseFormDialogProps) {
  const titleId = `${dialogId}-title`;
  const contentId = `${dialogId}-content`;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      disableEscapeKeyDown={isSubmitting}
      maxWidth="md"
      fullWidth
      scroll="body"
      aria-labelledby={titleId}
      aria-describedby={contentId}
      PaperProps={{ sx: paperSx }}
    >
      {/* Cabeçalho */}
      <DialogTitle component="div" id={titleId} sx={titleSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={iconWrapSx}>{icon}</Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          sx={closeButtonSx}
          size="small"
          aria-label="fechar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* Conteúdo */}
      <DialogContent id={contentId} sx={contentSx}>
        {children}
      </DialogContent>

      {/* Ações */}
      <DialogActions sx={actionsSx}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          variant="text"
          color="inherit"
          sx={discardBtnSx}
        >
          {discardLabel}
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={onSave}
          sx={saveBtnSx}
        >
          {isSubmitting ? savingLabel : saveLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
