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
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslations } from 'next-intl';

import type { Service, ServiceStatus } from '../types/service.types';

// Mapeamento de cores por Status
const STATUS_COLORS: Record<ServiceStatus, 'success' | 'error' | 'warning' | 'default'> = {
  ATIVO:        'success',
  INATIVO:      'error',
  EM_APROVACAO: 'warning',
  SUSPENSO:     'default',
};

interface ServiceTableProps {
  services: Service[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (svc: Service) => void;
  onDelete: (svc: Service) => void;
}

function CustomToolbar({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations('services');
  return (
    <GridToolbarContainer sx={{ p: 1.5, gap: 1, justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAdd}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
      >
        {t('newService')}
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

export function ServiceTable({
  services,
  isLoading,
  isError,
  errorMessage,
  onAdd,
  onEdit,
  onDelete,
}: ServiceTableProps) {
  const t = useTranslations('services');
  const tCommon = useTranslations('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const columns = useMemo<GridColDef<Service>[]>(() => [
    {
      field: 'name',
      headerName: t('columns.name'),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Service>) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            }}
          >
            <MiscellaneousServicesIcon fontSize="small" />
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value as string}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'organization',
      headerName: t('columns.organization'),
      flex: 1.5,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<Service>) => (
        <Typography variant="body2" color="text.primary" fontWeight={500}>
          {(params.value as string) ?? '—'}
        </Typography>
      ),
    },
    {
      field: 'version',
      headerName: t('columns.version'),
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Service>) =>
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
      field: 'status',
      headerName: t('columns.status'),
      width: 140,
      renderCell: (params: GridRenderCellParams<Service>) => {
        const st = params.value as ServiceStatus | null;
        if (!st) return <Typography variant="body2" color="text.disabled">—</Typography>;
        return (
          <Chip
            label={t(`status.${st}`)}
            size="small"
            color={STATUS_COLORS[st]}
            sx={{ fontWeight: 700, fontSize: 11, borderRadius: 1.5, minWidth: 100, justifyContent: 'center' }}
          />
        );
      },
    },
    {
      field: 'life_cycle',
      headerName: t('columns.lifeCycle'),
      flex: 1,
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<Service>) => (
        <Typography variant="body2">
          {params.value ? t(`lifeCycle.${params.value}`) : '—'}
        </Typography>
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
      renderCell: (params: GridRenderCellParams<Service>) => (
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

  const mobileColumns = useMemo<GridColDef<Service>[]>(
    () => columns.filter(c => ['name', '__actions__'].includes(c.field as string)),
    [columns],
  );

  const handleToolbarAdd = useCallback(onAdd, [onAdd]);

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
            {isLoading ? tCommon('loading') : t('pageSubtitle') /* Usar count se disponível ou subtítulo */}
          </Typography>
        }
        sx={{ px: 2.5, pt: 2.5, pb: 0 }}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataGrid<Service>
          rows={services}
          columns={isMobile ? mobileColumns : columns}
          getRowId={(row) => row.id}
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
          slots={{
            toolbar: () => <CustomToolbar onAdd={handleToolbarAdd} />,
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
              display: 'flex',
              alignItems: 'center',
            },
          }}
        />
      )}
    </Card>
  );
}
