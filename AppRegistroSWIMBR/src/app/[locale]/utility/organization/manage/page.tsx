'use client';

import { Box, Typography, Button } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function OrganizationManagePage() {
  const t = useTranslations('navigation');
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Página em Construção: {t('todos')} {/* Apenas como exemplo */}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Rota: `/utility/organization/manage`
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" href="/utility/document/documentTable">
          Voltar para Documentos
        </Button>
      </Box>
    </Box>
  );
}
