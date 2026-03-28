'use client';

import { memo, useMemo } from 'react';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import ContentPasteSearchTwoToneIcon from '@mui/icons-material/ContentPasteSearchTwoTone';
import { useTranslations } from 'next-intl';

import { SystemLog } from '../types/log.types';
import { BaseDataTable } from '@/components/common/table';

const SeverityChip = memo(function SeverityChip({ severity }: { severity: string }) {
  const getSeverityStyle = (s: string) => {
    switch (s) {
      case 'CRITICAL': return { color: 'error', label: 'CRITICAL' };
      case 'ERROR': return { color: 'error', label: 'ERROR' };
      case 'WARNING': return { color: 'warning', label: 'WARNING' };
      case 'INFO': default: return { color: 'info', label: 'INFO' };
    }
  };
  
  const style = getSeverityStyle(severity);
  return <Chip size="small" label={style.label} color={style.color as any} variant="outlined" />;
});

interface LogTableProps {
  logs: SystemLog[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onView: (log: SystemLog) => void;
  // Propriedades para lidar com paginacao customizada local ou nativa
  rowCount?: number;
}

export function LogTable({ logs, isLoading, isError, errorMessage, onView, rowCount }: LogTableProps) {
  const t = useTranslations('logs.table');
  const commonT = useTranslations('common');

  const columns = useMemo<GridColDef<SystemLog>[]>(
    () => [
      {
        field: 'timestamp',
        headerName: t('columns.timestamp'),
        width: 170,
        valueGetter: (_params, row) => new Date(row.timestamp).toLocaleString(),
      },
      {
        field: 'severity',
        headerName: t('columns.severity'),
        width: 100,
        renderCell: ({ value }) => <SeverityChip severity={value} />,
      },
      {
        field: 'event_type',
        headerName: t('columns.eventType'),
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'user_id',
        headerName: t('columns.user'),
        width: 120,
        valueGetter: (_params, row) => row.user_id || '—',
      },
      {
        field: 'resource_type',
        headerName: t('columns.resource'),
        width: 120,
        valueGetter: (_params, row) => row.resource_type || '—',
      },
      {
        field: 'endpoint',
        headerName: t('columns.endpoint'),
        flex: 1.5,
        minWidth: 150,
      },
      {
        field: 'actions',
        headerName: t('columns.actions'),
        width: 70,
        sortable: false,
        align: 'center',
        renderCell: ({ row }) => (
          <Tooltip title={commonT('actions.view')}>
            <IconButton size="small" onClick={() => onView(row)} color="primary">
              <ContentPasteSearchTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [t, commonT, onView]
  );

  return (
    <BaseDataTable<SystemLog>
      rows={logs}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage || commonT('messages.error')}
      title={t('title')}
      subtitle={t('subtitle', { count: logs.length })}
      getRowId={(row) => row.id}
      rowsPerPageLabel={commonT('table.rowsPerPageLabel')}
    />
  );
}
