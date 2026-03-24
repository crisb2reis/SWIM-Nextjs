'use client';

/**
 * Módulo: features/documents/components/DocumentTable.tsx
 * Descrição: Tabela de documentos responsiva com DataGrid (MUI) e ações inline.
 *            Segue o padrão Presentation Component: recebe dados e callbacks via props.
 */

import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardHeader,
  Typography,
  Tooltip,
  IconButton,
  Chip,
  Skeleton,
  Alert,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArticleIcon from '@mui/icons-material/Article';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';

import type { Document } from '../types/document.types';

import { useTranslations } from 'next-intl';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onView: (doc: Document) => void;
}

// ─── Toolbar customizada ──────────────────────────────────────────────────────

function CustomToolbar({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations('documents');
  return (
    <GridToolbarContainer sx={{ p: 1.5, gap: 1, justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAdd}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
      >
        {t('newDocument')}
      </Button>
      <Box display="flex" gap={1} alignItems="center">
        <Box sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}>
          <GridToolbarQuickFilter />
        </Box>
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
}

// ─── Skeleton de carregamento ─────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function DocumentTable({
  documents,
  isLoading,
  isError,
  errorMessage,
  onAdd,
  onEdit,
  onDelete,
  onView,
}: DocumentTableProps) {
  const t = useTranslations('documents');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  // ─── Definição das colunas ────────────────────────────────────────────────

  const columns = useMemo<GridColDef<Document>[]>(() => [
    {
      field: 'title',
      headerName: t('columns.title'),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Document>) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            }}
          >
            <ArticleIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value as string}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'publish',
      headerName: t('columns.publisher'),
      flex: 1.5,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<Document>) => (
        <Typography variant="body2" color="text.secondary">
          {(params.value as string) ?? '—'}
        </Typography>
      ),
    },
    {
      field: 'date_issued',
      headerName: t('columns.date'),
      width: 140,
      renderCell: (params: GridRenderCellParams<Document>) => (
        <Typography variant="body2" color="text.secondary">
          {params.row.date_issued ?? params.row.dateIssued ?? '—'}
        </Typography>
      ),
    },
    {
      field: 'version',
      headerName: t('columns.version'),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Document>) =>
        params.value ? (
          <Chip
            label={params.value as string}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: 11 }}
          />
        ) : null,
    },
    {
      field: '__actions__',
      headerName: t('columns.actions'),
      width: 130,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Document>) => (
        <Box display="flex" gap={0.5} justifyContent="center">
          <Tooltip title={t('tooltips.view')}>
            <IconButton
              size="small"
              onClick={() => onView(params.row)}
              sx={{ color: theme.palette.info.main }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tooltips.edit')}>
            <IconButton
              size="small"
              onClick={() => onEdit(params.row)}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.light },
              }}
            >
              <EditTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tooltips.delete')}>
            <IconButton
              size="small"
              onClick={() => onDelete(params.row)}
              sx={{
                color: theme.palette.error.main,
                '&:hover': { bgcolor: theme.palette.error.light },
              }}
            >
              <DeleteTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [theme, onView, onEdit, onDelete, t]);

  const mobileColumns = useMemo<GridColDef<Document>[]>(
    () => columns.filter(c => ['title', '__actions__'].includes(c.field as string)),
    [columns],
  );

  const handleToolbarAdd = useCallback(onAdd, [onAdd]);

  // ─── Estados de UI ────────────────────────────────────────────────────────

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {errorMessage ?? t('tableLoadError')}
      </Alert>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            {t('managementTitle')}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {isLoading ? t('loading') : t('docCount', { count: documents.length })}
          </Typography>
        }
        sx={{ px: 2.5, pt: 2.5, pb: 0 }}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataGrid<Document>
          rows={documents}
          columns={isMobile ? mobileColumns : columns}
          getRowId={(row) => row.id ?? Math.random()}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          localeText={{
            toolbarFilters: t('dataGrid.filters'),
            toolbarExport: t('dataGrid.export'),
            toolbarQuickFilterPlaceholder: t('dataGrid.quickFilter'),
            noRowsLabel: t('dataGrid.noRows'),
            columnMenuSortAsc: t('dataGrid.sortAsc'),
            columnMenuSortDesc: t('dataGrid.sortDesc'),
            columnMenuFilter: t('dataGrid.filter'),
            columnMenuHideColumn: t('dataGrid.hide'),
            columnMenuShowColumns: t('dataGrid.showColumns'),
          }}
          slotProps={{
            pagination: {
              labelRowsPerPage: t('dataGrid.rowsPerPage'),
              labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
                `${from}-${to} ${t('dataGrid.of')} ${count !== -1 ? count : `${t('dataGrid.moreThan')} ${to}`}`,
            },
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            }
          }}
          slots={{
            toolbar: () => <CustomToolbar onAdd={handleToolbarAdd} />,
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
              fontWeight: 700,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: theme.palette.action.hover,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
            },
          }}
        />
      )}
    </Card>
  );
}
