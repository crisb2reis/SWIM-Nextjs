'use client';

import { useState, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Snackbar, 
  Alert,
  Paper,
  Grid
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useTranslations } from 'next-intl';

import { useLogQuery, useLogStatisticsQuery } from './hooks/useLogQuery';
import { LogTable } from './components/LogTable';
import { LogDetailDialog } from './components/LogDetailDialog';
import { LogFilters } from './components/LogFilters';
import { LogStatisticsPanel } from './components/LogStatisticsPanel';
import { SystemLog } from './types/log.types';

export function LogsContainer() {
  const commonT = useTranslations('common');
  const navT = useTranslations('navigation');
  const t = useTranslations('logs');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const { data, isLoading, isError } = useLogQuery(page * rowsPerPage, rowsPerPage, filters);
  const { data: stats, isLoading: isLoadingStats } = useLogStatisticsQuery();

  const handleViewLog = useCallback((log: SystemLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedLog(null);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {commonT('home')}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {navT('logs')}
          </Typography>
        </Breadcrumbs>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {t('title')}
        </Typography>
          <Typography variant="body1" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>

      {/* Filtros */}
      <LogFilters onFilterChange={setFilters} />

      {/* Painel de Estatísticas */}
      <LogStatisticsPanel stats={stats} isLoading={isLoadingStats} />

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <LogTable
          logs={data?.items || []}
          isLoading={isLoading}
          isError={isError}
          onView={handleViewLog}
          rowCount={data?.total}
        />
      </Paper>

      <LogDetailDialog
        open={isDetailOpen}
        log={selectedLog}
        onClose={handleCloseDetail}
      />
    </Container>
  );
}
