'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { alpha } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { SystemLog } from '../types/log.types';

interface LogDetailDialogProps {
  log: SystemLog | null;
  open: boolean;
  onClose: () => void;
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  const t = useTranslations('logs.dialog');
  const commonT = useTranslations('common');
  const actionT = useTranslations('actions');
  
  const [showTechnical, setShowTechnical] = useState(false);

  const handleClose = useCallback(() => {
    setShowTechnical(false);
    onClose();
  }, [onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="log-detail-title"
    >
      <DialogTitle id="log-detail-title">
        {t('title')} {log ? `- ${log.event_type}` : ''}
      </DialogTitle>
      
      <DialogContent dividers>
        {!log ? (
           <Typography variant="body2" color="text.secondary">
             {commonT('noRecords')}
           </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Data e Hora */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t('timestamp')}
              </Typography>
              <Typography variant="body2">
                {new Date(log.timestamp).toLocaleString()}
              </Typography>
            </Box>
            <Divider />

            {/* Contexto de Usuário */}
            {(log.user_id || log.user_ip) && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('userContext')}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1, mt: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{t('userId')}:</Typography>
                    <Typography variant="body2">{log.user_id || 'N/A'}</Typography>
                    
                    <Typography variant="body2" fontWeight={600}>{t('userEmail')}:</Typography>
                    <Typography variant="body2">{log.user_email || 'N/A'}</Typography>
                    
                    <Typography variant="body2" fontWeight={600}>{t('userIp')}:</Typography>
                    <Typography variant="body2">{log.user_ip || 'N/A'}</Typography>
                    
                    <Typography variant="body2" fontWeight={600}>{t('userAgent')}:</Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{log.user_agent || 'N/A'}</Typography>
                  </Box>
                </Box>
                <Divider />
              </>
            )}

            {/* Rede */}
            {(log.endpoint || log.method || log.status_code) && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('network')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                    {log.method} {log.endpoint} [{log.status_code}] 
                    <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                       ({log.response_time_ms != null ? `${log.response_time_ms}ms` : 'N/A'})
                    </Typography>
                  </Typography>
                </Box>
                <Divider />
              </>
            )}

            {/* Operação */}
            {(log.resource_type || log.action) && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('operation')}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1, mt: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{t('resource')}:</Typography>
                    <Typography variant="body2">{log.resource_type} {log.resource_id ? `(${log.resource_id})` : ''}</Typography>
                    
                    <Typography variant="body2" fontWeight={600}>{t('action')}:</Typography>
                    <Typography variant="body2">{log.action}</Typography>
                  </Box>
                </Box>
                <Divider />
              </>
            )}

            {/* Alterações (Diff) */}
            {log.changes && log.changes.length > 0 && (
              <>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('changes')}
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflowX: 'auto',
                      fontSize: '0.85rem'
                    }}
                  >
                    {JSON.stringify(log.changes, null, 2)}
                  </Box>
                </Box>
                <Divider />
              </>
            )}

            {/* Erros e Stack Trace */}
            {log.error_message && (
              <Box>
                <Typography variant="subtitle2" color="error.main">
                  {t('errorDetails')}
                </Typography>
                <Typography variant="body2" color="error.main" fontWeight={500} sx={{ mt: 0.5 }}>
                  {log.error_message}
                </Typography>
                
                {log.stack_trace && (
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={showTechnical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => setShowTechnical(!showTechnical)}
                      sx={{ textTransform: 'none' }}
                    >
                      {showTechnical ? t('hideTechnical') : t('showTechnical')}
                    </Button>
                    
                    {showTechnical && (
                       <Box
                         component="pre"
                         sx={{
                           mt: 1,
                           p: 2,
                           bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                           color: 'error.main',
                           border: '1px solid',
                           borderColor: 'error.light',
                           borderRadius: 1,
                           overflowX: 'auto',
                           overflowY: 'auto',
                           fontSize: '0.75rem',
                           fontFamily: 'monospace',
                           maxHeight: '300px'
                         }}
                       >
                         {log.stack_trace}
                       </Box>
                     )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          {actionT('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
