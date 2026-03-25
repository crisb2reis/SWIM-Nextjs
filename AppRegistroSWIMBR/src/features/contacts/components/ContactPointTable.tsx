'use client';

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
  Button
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
import PersonIcon from '@mui/icons-material/Person';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { TablePagination } from '@mui/material';
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

function CustomToolbar({ onAdd }: { onAdd: () => void }) {
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
}

function TableSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const columns = useMemo<GridColDef<ContactPoint>[]>(() => [
    {
      field: 'name',
      headerName: t('columns.name'),
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<ContactPoint>) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            }}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value as string}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: t('columns.email'),
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<ContactPoint>) => (
        <Typography 
          variant="body2" 
          color="primary" 
          component="a" 
          href={`mailto:${params.value}`}
          sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: 'role',
      headerName: t('columns.role'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<ContactPoint>) => (
        <Typography variant="body2">
          {params.value as string || '—'}
        </Typography>
      ),
    },
    {
      field: 'organization_name',
      headerName: t('columns.organization'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<ContactPoint>) => (
        <Chip 
          label={params.value as string || '—'} 
          size="small" 
          variant="outlined"
          sx={{ fontStyle: 'italic', color: 'text.secondary' }}
        />
      ),
    },
    {
      field: '__actions__',
      headerName: t('columns.actions'),
      width: 110,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<ContactPoint>) => (
        <Box display="flex" gap={0.5} justifyContent="center">
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
  ], [theme, onEdit, onDelete, t]);

  const tdg = useTranslations('documents.dataGrid');

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
          columns={columns}
          getRowId={(row) => row.id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          localeText={{
            toolbarFilters: tdg('filters'),
            toolbarExport: tdg('export'),
            toolbarQuickFilterPlaceholder: tdg('quickFilter'),
            noRowsLabel: t('dataGrid.noRows'),
            columnMenuSortAsc: tdg('sortAsc'),
            columnMenuSortDesc: tdg('sortDesc'),
            columnMenuFilter: tdg('filter'),
            columnMenuHideColumn: tdg('hide'),
            columnMenuShowColumns: tdg('showColumns'),
          }}
          slotProps={{
            pagination: {
              labelRowsPerPage: tdg('rowsPerPage'),
              labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
                `${from}-${to} ${tdg('of')} ${count !== -1 ? count : `${tdg('moreThan')} ${to}`}`
            }
          }}
          slots={{
            toolbar: () => <CustomToolbar onAdd={onAdd} />,
          }}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f8f9fa',
              borderBottom: `2px solid ${theme.palette.divider}`,
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 800,
                color: theme.palette.primary.main,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05rem',
              },
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: theme.palette.action.hover,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
          }}
        />
      )}
    </Card>
  );
}
