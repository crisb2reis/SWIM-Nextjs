'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Box, Card, CardHeader, Typography, Tooltip, IconButton,
  Skeleton, Alert, useMediaQuery, useTheme, Avatar, Button,
  TablePagination,
} from '@mui/material';
import {
  DataGrid, type GridColDef, type GridRenderCellParams,
  GridToolbarQuickFilter, GridToolbarContainer, GridToolbarExport,
} from '@mui/x-data-grid';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import BusinessIcon from '@mui/icons-material/Business';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useTranslations } from 'next-intl';

import type { Organization } from '@/features/contacts/types/organization.types';

interface OrganizationTableProps {
  organizations: Organization[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001';

function CustomToolbar({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations('organizations');
  return (
    <GridToolbarContainer sx={{ p: 1.5, gap: 1, justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAdd}
        sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
      >
        {t('newOrganization')}
      </Button>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <GridToolbarQuickFilter
          placeholder={t('dataGrid.quickFilter')}
          sx={{ '& .MuiInputBase-root': { borderRadius: 2, fontSize: 13 } }}
        />
        <GridToolbarExport
          slotProps={{ tooltip: { title: t('dataGrid.export') }, button: { size: 'small', sx: { borderRadius: 2 } } }}
        />
      </Box>
    </GridToolbarContainer>
  );
}

export function OrganizationTable({
  organizations, isLoading, isError, errorMessage, onAdd, onEdit, onDelete,
}: OrganizationTableProps) {
  const t = useTranslations('organizations');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'logo_url',
      headerName: t('columns.logo'),
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Organization>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Avatar
            src={params.value ? `${API_BASE}${params.value}` : undefined}
            sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
          >
            <BusinessIcon fontSize="small" />
          </Avatar>
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: t('columns.name'),
      flex: 2,
      minWidth: 180,
    },
    {
      field: 'acronym',
      headerName: t('columns.acronym'),
      width: 120,
      renderCell: (params: GridRenderCellParams<Organization>) =>
        params.value ? (
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.3,
            bgcolor: 'primary.light', borderRadius: 99, color: 'primary.contrastText',
            fontWeight: 700, fontSize: 12,
          }}>
            {params.value}
          </Box>
        ) : '—',
    },
    ...(!isMobile ? [{
      field: 'description',
      headerName: t('columns.description'),
      flex: 3,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<Organization>) => (
        <Typography variant="body2" noWrap color="text.secondary">
          {params.value || '—'}
        </Typography>
      ),
    } as GridColDef] : []),
    {
      field: 'actions',
      headerName: t('columns.actions'),
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Organization>) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
          <Tooltip title={t('tooltips.edit')}>
            <IconButton size="small" color="primary" onClick={() => onEdit(params.row)}>
              <EditTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('tooltips.delete')}>
            <IconButton size="small" color="error" onClick={() => onDelete(params.row)}>
              <DeleteTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [t, isMobile, onEdit, onDelete]);

  if (isLoading) {
    return (
      <Card sx={{ borderRadius: 4, p: 2 }}>
        {[...Array(5)].map((_, i) => <Skeleton key={i} height={52} sx={{ mb: 1 }} />)}
      </Card>
    );
  }

  if (isError) {
    return <Alert severity="error" sx={{ borderRadius: 3 }}>{errorMessage}</Alert>;
  }

  const paginated = organizations.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>{t('managementTitle')}</Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {t('count', { count: organizations.length })}
          </Typography>
        }
        sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 2 }}
      />
      <DataGrid
        rows={paginated}
        columns={columns}
        getRowId={(row) => row.id}
        hideFooter
        disableRowSelectionOnClick
        autoHeight
        slots={{ toolbar: CustomToolbar }}
        slotProps={{ toolbar: { onAdd } }}
        localeText={{
          toolbarQuickFilterPlaceholder: t('dataGrid.quickFilter'),
          noRowsLabel: t('dataGrid.noRows'),
          columnMenuSortAsc: t('dataGrid.sortAsc'),
          columnMenuSortDesc: t('dataGrid.sortDesc'),
          columnMenuFilter: t('dataGrid.filter'),
          columnMenuHideColumn: t('dataGrid.hide'),
          columnMenuShowColumns: t('dataGrid.showColumns'),
          toolbarExport: t('dataGrid.export'),
          toolbarFilters: t('dataGrid.filters'),
        }}
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'background.default',
            borderBottom: '2px solid',
            borderColor: 'divider',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: 'text.secondary',
            },
          },
          '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
          '& .MuiDataGrid-cell': { borderColor: 'divider', alignContent: 'center' },
        }}
      />
      <TablePagination
        component="div"
        count={organizations.length}
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
        labelRowsPerPage={t('dataGrid.rowsPerPage')}
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />
    </Card>
  );
}
