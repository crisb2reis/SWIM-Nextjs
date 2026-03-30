'use client';

import { memo, useMemo } from 'react';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { ChipProps } from '@mui/material';
import ContentPasteSearchTwoToneIcon from '@mui/icons-material/ContentPasteSearchTwoTone';
import { useTranslations } from 'next-intl';

import { SystemLog } from '../types/log.types';
import { BaseDataTable } from '@/components/common/table';

/**
 * Mapa de estilos para severidade de logs.
 * Externalizado para evitar recriação a cada render.
 */
const SEVERITY_STYLES: Record<string, { color: ChipProps['color']; label: string }> = {
  CRITICAL: { color: 'error', label: 'CRITICAL' },
  ERROR: { color: 'error', label: 'ERROR' },
  WARNING: { color: 'warning', label: 'WARNING' },
  INFO: { color: 'info', label: 'INFO' },
};

const SeverityChip = memo(function SeverityChip({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.INFO;
  return <Chip size="small" label={style.label} color={style.color} variant="outlined" />;
});

interface LogTableProps {
  logs: SystemLog[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onView: (log: SystemLog) => void;
  /**
   * Total de registros no servidor.
   * Reservado para paginação server-side — ainda não implementado.
   */
  rowCount?: number;
}

export function LogTable({ logs, isLoading, isError, errorMessage, onView, rowCount }: LogTableProps) {
  const t = useTranslations('logs.table');
  const commonT = useTranslations('common');
  const actionT = useTranslations('actions');

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
          <Tooltip title={actionT('view')}>
            <IconButton size="small" onClick={() => onView(row)} color="primary">
              <ContentPasteSearchTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [t, actionT, onView]
  );

  return (
    <BaseDataTable<SystemLog>
      rows={logs}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage || commonT('messages.error')}
      title={t('title')}
      subtitle={t('subtitle', { count: rowCount ?? logs.length })}
      getRowId={(row) => row.id}
    />
  );
}
