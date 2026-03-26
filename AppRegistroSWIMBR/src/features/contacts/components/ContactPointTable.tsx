'use client';

import { memo, useMemo } from 'react';
import { Box, Typography, Avatar, useTheme, type Palette } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslations } from 'next-intl';

import type { ContactPoint } from '../types/contact.types';
import {
  BaseDataTable,
  useTableActions,
  EmailCell,
  OrgChipCell,
} from '@/components/common/table';

// ─── Células memoizadas ───────────────────────────────────────────────────────

const NameCell = memo(function NameCell({
  row,
  palette,
}: {
  row: ContactPoint;
  palette: Palette;
}) {
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
        <PersonIcon fontSize="small" />
      </Avatar>
      <Typography variant="body2" fontWeight={500}>
        {row.name}
      </Typography>
    </Box>
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContactPointTableProps {
  contacts: ContactPoint[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (contact: ContactPoint) => void;
  onDeleteRequest: (contact: ContactPoint) => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ContactPointTable({
  contacts,
  isLoading,
  isError,
  errorMessage,
  onAdd,
  onEdit,
  onDeleteRequest,
}: ContactPointTableProps) {
  const t = useTranslations('contacts');
  const tCommon = useTranslations('common');
  const { palette } = useTheme();

  const actionsColumn = useTableActions<ContactPoint>({
    onEdit,
    onDeleteRequest,
    headerName: t('columns.actions'),
    editLabel: t('tooltips.edit'),
    deleteLabel: t('tooltips.delete'),
    getRowName: (row) => row.name,
  });

  const columns = useMemo<GridColDef<ContactPoint>[]>(
    () => [
      {
        field: 'name',
        headerName: t('columns.name'),
        flex: 1.5,
        minWidth: 180,
        renderCell: ({ row }) => <NameCell row={row} palette={palette} />,
      },
      {
        field: 'email',
        headerName: t('columns.email'),
        flex: 1.5,
        minWidth: 200,
        renderCell: ({ row }) => <EmailCell email={row.email} />,
      },
      {
        field: 'role',
        headerName: t('columns.role'),
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }) => (
          <Typography variant="body2">{row.role || '—'}</Typography>
        ),
      },
      {
        field: 'organization_name',
        headerName: t('columns.organization'),
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }) => <OrgChipCell name={row.organization_name} />,
      },
      actionsColumn,
    ],
    [palette, actionsColumn, t],
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
    <BaseDataTable<ContactPoint>
      rows={contacts}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage || tCommon('errorOccurred')}
      title={t('managementTitle')}
      subtitle={t('count', { count: contacts.length })}
      loadingText={tCommon('loading')}
      onAdd={onAdd}
      addLabel={t('newContact')}
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
