'use client';

import { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import { useTranslations } from 'next-intl';

import type { Service, ServiceStatus } from '../types/service.types';
import { BaseDataTable, useTableActions } from '@/components/common/table';

// ─── Mapeamento de cores por Status ───────────────────────────────────────────

const STATUS_COLORS: Record<ServiceStatus, 'success' | 'error' | 'warning' | 'default'> = {
  ATIVO: 'success',
  INATIVO: 'error',
  EM_APROVACAO: 'warning',
  SUSPENSO: 'default',
};

// ─── Células memoizadas ───────────────────────────────────────────────────────

const NameCell = memo(function NameCell({
  row,
}: {
  row: Service;
}) {
  const { palette } = useTheme();
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: palette.primary.light,
          color: palette.primary.contrastText,
        }}
      >
        <MiscellaneousServicesIcon fontSize="small" />
      </Avatar>
      <Typography variant="body2" fontWeight={500}>
        {row.name}
      </Typography>
    </Box>
  );
});

const StatusChip = memo(function StatusChip({
  status,
  label,
}: {
  status: ServiceStatus | null | undefined;
  label: string;
}) {
  if (!status) {
    return <Typography variant="body2" color="text.disabled">—</Typography>;
  }
  return (
    <Chip
      label={label}
      size="small"
      color={STATUS_COLORS[status]}
      sx={{ fontWeight: 700, fontSize: 11, borderRadius: 1.5, minWidth: 100, justifyContent: 'center' }}
    />
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (svc: Service) => void;
  onDeleteRequest: (svc: Service) => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ServiceTable({
  services,
  isLoading,
  isError,
  errorMessage,
  onAdd,
  onEdit,
  onDeleteRequest,
}: ServiceTableProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');

  const actionsColumn = useTableActions<Service>({
    onEdit,
    onDeleteRequest,
    headerName: t('columns.actions'),
    editLabel: t('tooltips.edit'),
    deleteLabel: t('tooltips.delete'),
    getRowName: (row) => row.name,
  });

  const columns = useMemo<GridColDef<Service>[]>(
    () => [
      {
        field: 'name',
        headerName: t('columns.name'),
        flex: 2,
        minWidth: 200,
        renderCell: ({ row }) => <NameCell row={row} />,
      },
      {
        field: 'organization',
        headerName: t('columns.organization'),
        flex: 1.5,
        minWidth: 160,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {row.organization ?? '—'}
          </Typography>
        ),
      },
      {
        field: 'version',
        headerName: t('columns.version'),
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) =>
          row.version ? (
            <Chip
              label={row.version}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: 11 }}
            />
          ) : null,
      },
      {
        field: 'status',
        headerName: t('columns.status'),
        width: 140,
        renderCell: ({ row }) => {
          const st = row.status as ServiceStatus | null;
          return (
            <StatusChip
              status={st}
              label={st ? t(`status.${st}`) : ''}
            />
          );
        },
      },
      {
        field: 'life_cycle',
        headerName: t('columns.lifeCycle'),
        flex: 1,
        minWidth: 130,
        renderCell: ({ row }) => (
          <Typography variant="body2">
            {row.life_cycle ? t(`lifeCycle.${row.life_cycle}`) : '—'}
          </Typography>
        ),
      },
      actionsColumn,
    ],
    [actionsColumn, t],
  );

  const localeText = useMemo(
    () => ({
      toolbarFilters: t('dataGrid.filters'),
      toolbarExport: t('dataGrid.export'),
      toolbarQuickFilterPlaceholder: t('dataGrid.quickFilter'),
      noRowsLabel: t('dataGrid.noRows'),
      columnMenuSortAsc: t('dataGrid.sortAsc'),
      columnMenuSortDesc: t('dataGrid.sortDesc'),
      columnMenuFilter: t('dataGrid.filter'),
      columnMenuHideColumn: t('dataGrid.hide'),
      columnMenuShowColumns: t('dataGrid.showColumns'),
    }),
    [t],
  );

  return (
    <BaseDataTable<Service>
      rows={services}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage || t('messages.loadError')}
      title={t('managementTitle')}
      subtitle={t('pageSubtitle')}
      loadingText={tCommon('loading')}
      onAdd={onAdd}
      addLabel={t('newService')}
      onDeleteRequest={onDeleteRequest}
      canExport={false}
      mobileFields={['name', 'actions']}
      localeText={localeText}
      rowsPerPageLabel={t('dataGrid.rowsPerPage')}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} ${t('dataGrid.of')} ${count !== -1 ? count : `${t('dataGrid.moreThan')} ${to}`}`
      }
    />
  );
}
