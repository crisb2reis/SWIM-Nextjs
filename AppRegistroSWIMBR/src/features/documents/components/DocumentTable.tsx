'use client';

/**
 * Módulo: features/documents/components/DocumentTable.tsx
 * Tabela de documentos responsiva usando BaseDataTable compartilhado.
 */

import { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  type Palette,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ArticleIcon from '@mui/icons-material/Article';
import { useTranslations } from 'next-intl';

import type { Document } from '../types/document.types';
import { BaseDataTable } from '@/components/common/table';

// ─── Células memoizadas ───────────────────────────────────────────────────────

const TitleCell = memo(function TitleCell({
  row,
  palette,
}: {
  row: Document;
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
        <ArticleIcon fontSize="small" />
      </Avatar>
      <Typography variant="body2" fontWeight={500}>
        {row.title}
      </Typography>
    </Box>
  );
});

const VersionChip = memo(function VersionChip({ version }: { version?: string }) {
  if (!version) return null;
  return (
    <Chip
      label={version}
      size="small"
      color="primary"
      variant="outlined"
      sx={{ fontWeight: 600, fontSize: 11 }}
    />
  );
});

/**
 * Célula de ações customizada para documentos (inclui View).
 * Como tem 3 ações, não usamos useTableActions (que só tem 2).
 */
const DocumentActionsCell = memo(function DocumentActionsCell({
  row,
  onView,
  onEdit,
  onDeleteRequest,
  viewLabel,
  editLabel,
  deleteLabel,
}: {
  row: Document;
  onView: (row: Document) => void;
  onEdit: (row: Document) => void;
  onDeleteRequest: (row: Document) => void;
  viewLabel: string;
  editLabel: string;
  deleteLabel: string;
}) {
  const { palette } = useTheme();
  const rowName = row.title || '';

  return (
    <Box display="flex" gap={0.5} justifyContent="center">
      <Tooltip title={viewLabel}>
        <IconButton
          size="small"
          onClick={() => onView(row)}
          aria-label={`${viewLabel} ${rowName}`}
          sx={{ color: palette.info.main }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={editLabel}>
        <IconButton
          size="small"
          onClick={() => onEdit(row)}
          aria-label={`${editLabel} ${rowName}`}
          sx={{
            color: palette.primary.main,
            '&:hover': { bgcolor: palette.primary.light },
          }}
        >
          <EditTwoToneIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={deleteLabel}>
        <IconButton
          size="small"
          onClick={() => onDeleteRequest(row)}
          aria-label={`${deleteLabel} ${rowName}`}
          sx={{
            color: palette.error.main,
            '&:hover': { bgcolor: palette.error.light },
          }}
        >
          <DeleteTwoToneIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (doc: Document) => void;
  onDeleteRequest: (doc: Document) => void;
  onView: (doc: Document) => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function DocumentTable({
  documents,
  isLoading,
  isError,
  errorMessage,
  onAdd,
  onEdit,
  onDeleteRequest,
  onView,
}: DocumentTableProps) {
  const t = useTranslations('documents');
  const { palette } = useTheme();

  const columns = useMemo<GridColDef<Document>[]>(
    () => [
      {
        field: 'title',
        headerName: t('columns.title'),
        flex: 2,
        minWidth: 200,
        renderCell: ({ row }) => <TitleCell row={row} palette={palette} />,
      },
      {
        field: 'publish',
        headerName: t('columns.publisher'),
        flex: 1.5,
        minWidth: 160,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {row.publish ?? '—'}
          </Typography>
        ),
      },
      {
        field: 'date_issued',
        headerName: t('columns.date'),
        width: 140,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.primary">
            {row.date_issued ?? row.dateIssued ?? '—'}
          </Typography>
        ),
      },
      {
        field: 'version',
        headerName: t('columns.version'),
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => <VersionChip version={row.version} />,
      },
      {
        field: 'actions',
        headerName: t('columns.actions'),
        width: 130,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <DocumentActionsCell
            row={row}
            onView={onView}
            onEdit={onEdit}
            onDeleteRequest={onDeleteRequest}
            viewLabel={t('tooltips.view')}
            editLabel={t('tooltips.edit')}
            deleteLabel={t('tooltips.delete')}
          />
        ),
      },
    ],
    [palette, onView, onEdit, onDeleteRequest, t],
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
    <BaseDataTable<Document>
      rows={documents}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage ?? t('tableLoadError')}
      title={t('managementTitle')}
      subtitle={t('docCount', { count: documents.length })}
      loadingText={t('loading')}
      onAdd={onAdd}
      addLabel={t('newDocument')}
      canExport={false}
      mobileFields={['title', 'actions']}
      localeText={localeText}
      getRowId={(row) => row.id ?? Math.random()}
      rowsPerPageLabel={t('dataGrid.rowsPerPage')}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} ${t('dataGrid.of')} ${count !== -1 ? count : `${t('dataGrid.moreThan')} ${to}`}`
      }
    />
  );
}
