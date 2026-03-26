'use client';

import { memo, useMemo, useState } from 'react';
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
  Button
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslations } from 'next-intl';

import type { ContactPoint } from '../types/contact.types';

interface ContactPointTableProps {
  contacts: ContactPoint[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (contact: ContactPoint) => void;
  onDelete: (contact: ContactPoint) => void;
}

// ─── CustomToolbar memoizado ──────────────────────────────────────────────────

const CustomToolbar = memo(function CustomToolbar({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations('contacts');
  return (
    <GridToolbarContainer sx={{ p: 1.5, gap: 1, justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAdd}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
      >
        {t('newContact')}
      </Button>
      <Box display="flex" gap={1} alignItems="center">
        <Box sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}>
          <GridToolbarQuickFilter />
        </Box>
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
});

// ─── Skeleton de carregamento ─────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={`skeleton-row-${i}`} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ContactPointTable({
  contacts,
  isLoading,
  isError,
  errorMessage,
  onAdd,
  onEdit,
  onDelete,
}: ContactPointTableProps) {
  const t = useTranslations('contacts');
  const tCommon = useTranslations('common');
  const theme = useTheme();
  const { palette } = theme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const columns = useMemo<GridColDef<ContactPoint>[]>(() => [
    {
      field: 'name',
      headerName: t('columns.name'),
      flex: 1.5,
      minWidth: 180,
      renderCell: ({ row }) => (
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
      ),
    },
    {
      field: 'email',
      headerName: t('columns.email'),
      flex: 1.5,
      minWidth: 200,
      renderCell: ({ row }) =>
        row.email ? (
          <Typography
            variant="body2"
            color="primary"
            component="a"
            href={`mailto:${row.email}`}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {row.email}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        ),
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
      renderCell: ({ row }) => (
        <Chip
          label={row.organization_name || '—'}
          size="small"
          variant="outlined"
          sx={{ fontStyle: 'italic', color: 'text.secondary' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('columns.actions'),
      width: 110,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.5} justifyContent="center">
          <Tooltip title={t('tooltips.edit')}>
            <IconButton
              size="small"
              onClick={() => onEdit(row)}
              sx={{
                color: palette.primary.main,
                '&:hover': { bgcolor: palette.primary.light },
              }}
            >
              <EditTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tooltips.delete')}>
            <IconButton
              size="small"
              onClick={() => onDelete(row)}
              sx={{
                color: palette.error.main,
                '&:hover': { bgcolor: palette.error.light },
              }}
            >
              <DeleteTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [palette.primary, palette.error, onEdit, onDelete, t]);

  const mobileColumns = useMemo<GridColDef<ContactPoint>[]>(
    () => columns.filter(c => ['name', 'actions'].includes(c.field)),
    [columns],
  );

  const Toolbar = useMemo(() => () => <CustomToolbar onAdd={onAdd} />, [onAdd]);

  const localeText = useMemo(() => ({
    toolbarFilters: t('dataGrid.filters'),
    toolbarExport: t('dataGrid.export'),
    toolbarQuickFilterPlaceholder: t('dataGrid.quickFilter'),
    noRowsLabel: t('dataGrid.noRows'),
    columnMenuSortAsc: t('dataGrid.sortAsc'),
    columnMenuSortDesc: t('dataGrid.sortDesc'),
    columnMenuFilter: t('dataGrid.filter'),
    columnMenuHideColumn: t('dataGrid.hide'),
    columnMenuShowColumns: t('dataGrid.showColumns'),
  }), [t]);

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {errorMessage || t('messages.loadError')}
      </Alert>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${palette.divider}`,
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
            {isLoading ? tCommon('loading') : t('count', { count: contacts.length })}
          </Typography>
        }
        sx={{ px: 2.5, pt: 2.5, pb: 0 }}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataGrid<ContactPoint>
          rows={contacts}
          columns={isMobile ? mobileColumns : columns}
          getRowId={(row) => row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          localeText={localeText}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
            pagination: {
              labelRowsPerPage: t('dataGrid.rowsPerPage'),
              labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
                `${from}-${to} ${t('dataGrid.of')} ${count !== -1 ? count : `${t('dataGrid.moreThan')} ${to}`}`
            }
          }}
          slots={{ toolbar: Toolbar }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: palette.mode === 'dark' ? palette.grey[800] : '#f8f9fa',
              borderBottom: `2px solid ${palette.divider}`,
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 800,
                color: palette.primary.main,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05rem',
              },
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: palette.action.hover,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${palette.divider}`,
              display: 'flex',
              alignItems: 'center',
            },
          }}
        />
      )}
    </Card>
  );
}
