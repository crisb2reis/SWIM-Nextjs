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
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslations } from 'next-intl';

import type { Organization, OrganizationStatus, OrganizationTipo } from '../types/organization.types';
import { BaseDataTable, useTableActions } from '@/components/common/table';

import { BASE_URL } from '@/lib/axios';

// ─── Mapeamento de cores para Status ─────────────────────────────────────────

const STATUS_COLORS: Record<OrganizationStatus, 'success' | 'error' | 'warning'> = {
  ATIVO: 'success',
  INATIVO: 'error',
  EM_APROVACAO: 'warning',
};

// ─── Células memoizadas ───────────────────────────────────────────────────────

const LogoCell = memo(function LogoCell({ logoUrl }: { logoUrl?: string | null }) {
  const src = logoUrl ? `${BASE_URL}${logoUrl}` : undefined;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Avatar src={src} sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
        <BusinessIcon sx={{ fontSize: 18 }} />
      </Avatar>
    </Box>
  );
});

const AcronymChip = memo(function AcronymChip({ acronym }: { acronym?: string | null }) {
  if (!acronym) {
    return <Typography variant="body2" color="text.disabled">—</Typography>;
  }
  return (
    <Chip
      label={acronym}
      size="small"
      variant="outlined"
      color="primary"
      sx={{ fontWeight: 700, fontSize: 11, borderRadius: 1 }}
    />
  );
});

const StatusChip = memo(function StatusChip({
  status,
  label,
}: {
  status: OrganizationStatus | null | undefined;
  label: string;
}) {
  if (!status) {
    return <Typography variant="body2" color="text.disabled">—</Typography>;
  }
  return (
    <Chip
      label={label}
      size="small"
      color={STATUS_COLORS[status] ?? 'default'}
      sx={{ fontWeight: 700, fontSize: 11, borderRadius: 1, minWidth: 90, justifyContent: 'center' }}
    />
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrganizationTableProps {
  organizations: Organization[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (org: Organization) => void;
  onDeleteRequest: (org: Organization) => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function OrganizationTable({
  organizations,
  isLoading,
  isError,
  errorMessage,
  onAdd,
  onEdit,
  onDeleteRequest,
}: OrganizationTableProps) {
  const t = useTranslations('organizations');
  const theme = useTheme();
  const isMobile = theme.breakpoints.down('sm');

  const actionsColumn = useTableActions<Organization>({
    onEdit,
    onDeleteRequest,
    headerName: t('columns.actions'),
    editLabel: t('tooltips.edit'),
    deleteLabel: t('tooltips.delete'),
    getRowName: (row) => row.name,
    width: 90,
  });

  const columns = useMemo<GridColDef<Organization>[]>(
    () => [
      {
        field: 'logo_url',
        headerName: t('columns.logo'),
        width: 64,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => <LogoCell logoUrl={row.logo_url} />,
      },
      {
        field: 'name',
        headerName: t('columns.name'),
        flex: 2,
        minWidth: 180,
        renderCell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.name}
          </Typography>
        ),
      },
      {
        field: 'acronym',
        headerName: t('columns.acronym'),
        width: 110,
        renderCell: ({ row }) => <AcronymChip acronym={row.acronym} />,
      },
      {
        field: 'tipo',
        headerName: t('columns.tipo'),
        width: 130,
        renderCell: ({ row }) => {
          const tipo = row.tipo as OrganizationTipo | null;
          return tipo ? (
            <Typography variant="body2">{t(`tipo.${tipo}`)}</Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">—</Typography>
          );
        },
      },
      {
        field: 'status',
        headerName: t('columns.status'),
        width: 140,
        renderCell: ({ row }) => {
          const st = row.status as OrganizationStatus | null;
          return (
            <StatusChip
              status={st}
              label={st ? t(`status.${st}`) : ''}
            />
          );
        },
      },
      actionsColumn,
    ],
    [actionsColumn, t],
  );

  const localeText = useMemo(
    () => ({
      toolbarQuickFilterPlaceholder: t('dataGrid.quickFilter'),
      noRowsLabel: t('dataGrid.noRows'),
      columnMenuSortAsc: t('dataGrid.sortAsc'),
      columnMenuSortDesc: t('dataGrid.sortDesc'),
      columnMenuFilter: t('dataGrid.filter'),
      columnMenuHideColumn: t('dataGrid.hide'),
      columnMenuShowColumns: t('dataGrid.showColumns'),
      toolbarExport: t('dataGrid.export'),
      toolbarFilters: t('dataGrid.filters'),
    }),
    [t],
  );

  return (
    <BaseDataTable<Organization>
      rows={organizations}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      title={t('managementTitle')}
      onAdd={onAdd}
      addLabel={t('newOrganization')}
      onDeleteRequest={onDeleteRequest}
      canExport={false}
      mobileFields={['logo_url', 'name', 'actions']}
      localeText={localeText}
      pageSizeOptions={[8, 16, 32]}
      rowsPerPageLabel={t('dataGrid.rowsPerPage')}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}–${to} ${t('dataGrid.of')} ${count !== -1 ? count : `${t('dataGrid.moreThan')} ${to}`}`
      }
    />
  );
}
