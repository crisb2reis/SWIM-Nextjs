'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Box, Card, Typography, Tooltip, IconButton,
  Chip, Skeleton, Alert, useMediaQuery, useTheme,
  Avatar, Button, TablePagination,
} from '@mui/material';
import {
  DataGrid, type GridColDef, type GridRenderCellParams,
  GridToolbarQuickFilter, GridToolbarContainer, GridToolbarExport,
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import { useTranslations } from 'next-intl';

import type { Organization, OrganizationStatus, OrganizationTipo } from '../types/organization.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001';

// ─── Mapeamento de cores para Status ─────────────────────────────────────────

const STATUS_COLORS: Record<OrganizationStatus, 'success' | 'error' | 'warning'> = {
  ATIVO: 'success',
  INATIVO: 'error',
  EM_APROVACAO: 'warning',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrganizationTableProps {
  organizations: Organization[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onAdd: () => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function CustomToolbar({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations('organizations');
  return (
    <GridToolbarContainer sx={{ p: 1.5, gap: 1, justifyContent: 'space-between' }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={onAdd}
        sx={{ borderRadius: 1, fontWeight: 600, textTransform: 'none', px: 2 }}
      >
        {t('newOrganization')}
      </Button>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <GridToolbarQuickFilter
          placeholder={t('dataGrid.quickFilter')}
          sx={{ '& .MuiInputBase-root': { borderRadius: 1, fontSize: 13 } }}
        />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function OrganizationTable({
  organizations, isLoading, isError, errorMessage, onAdd, onEdit, onDelete,
}: OrganizationTableProps) {
  const t = useTranslations('organizations');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);

  const handleAdd = useCallback(onAdd, [onAdd]);

  const columns = useMemo<GridColDef[]>(() => [
    // ── Logo ──
    {
      field: 'logo_url',
      headerName: t('columns.logo'),
      width: 64,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Organization>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Avatar
            src={params.value ? `${API_BASE}${params.value}` : undefined}
            sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
          >
            <BusinessIcon sx={{ fontSize: 18 }} />
          </Avatar>
        </Box>
      ),
    },
    // ── Nome ──
    {
      field: 'name',
      headerName: t('columns.name'),
      flex: 2,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Organization>) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value as string}
        </Typography>
      ),
    },
    // ── Sigla ──
    {
      field: 'acronym',
      headerName: t('columns.acronym'),
      width: 110,
      renderCell: (params: GridRenderCellParams<Organization>) =>
        params.value ? (
          <Chip
            label={params.value as string}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 700, fontSize: 11, borderRadius: 1 }}
          />
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        ),
    },
    // ── Tipo ──
    ...(!isMobile ? [{
      field: 'tipo',
      headerName: t('columns.tipo'),
      width: 130,
      renderCell: (params: GridRenderCellParams<Organization>) => {
        const tipo = params.value as OrganizationTipo | null;
        return tipo ? (
          <Typography variant="body2">{t(`tipo.${tipo}`)}</Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        );
      },
    } as GridColDef] : []),
    // ── Status ──
    {
      field: 'status',
      headerName: t('columns.status'),
      width: 140,
      renderCell: (params: GridRenderCellParams<Organization>) => {
        const st = params.value as OrganizationStatus | null;
        if (!st) return <Typography variant="body2" color="text.disabled">—</Typography>;
        return (
          <Chip
            label={t(`status.${st}`)}
            size="small"
            color={STATUS_COLORS[st] ?? 'default'}
            sx={{ fontWeight: 700, fontSize: 11, borderRadius: 1, minWidth: 90, justifyContent: 'center' }}
          />
        );
      },
    },
    // ── Ações ──
    {
      field: '__actions__',
      headerName: t('columns.actions'),
      width: 90,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<Organization>) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
          <Tooltip title={t('tooltips.edit')}>
            <IconButton size="small" color="primary" onClick={() => onEdit(params.row)}>
              <EditIcon fontSize="small" />
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
      <Card sx={{ borderRadius: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
        {[...Array(8)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)}
      </Card>
    );
  }

  if (isError) {
    return <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMessage}</Alert>;
  }

  const paginated = organizations.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
    >
      <DataGrid
        rows={paginated}
        columns={columns}
        getRowId={(row) => row.id}
        hideFooter
        disableRowSelectionOnClick
        autoHeight
        slots={{ toolbar: CustomToolbar }}
        slotProps={{ toolbar: { onAdd: handleAdd } }}
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
            bgcolor: '#f8f9fa',
            borderBottom: '2px solid',
            borderColor: 'divider',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 800,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              color: 'primary.dark',
            },
          },
          '& .MuiDataGrid-row': {
            cursor: 'default',
            '&:hover': { bgcolor: 'action.hover' },
          },
          '& .MuiDataGrid-cell': {
            borderColor: 'divider',
            alignContent: 'center',
            py: 0.75,
          },
        }}
      />

      {/* ── Paginação no rodapé ── */}
      <TablePagination
        component="div"
        count={organizations.length}
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[8, 16, 32]}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
        labelRowsPerPage={t('dataGrid.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} ${t('dataGrid.of')} ${count !== -1 ? count : `${t('dataGrid.moreThan')} ${to}`}`
        }
        sx={{ borderTop: '1px solid', borderColor: 'divider' }}
      />
    </Card>
  );
}
