'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  Typography,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridValidRowModel, type GridSlotsComponent } from '@mui/x-data-grid';

import { TableSkeleton } from './TableSkeleton';
import { TableToolbar, type TableToolbarProps } from './TableToolbar';

// ─── Estilos estáveis ────────────────────────────────────────────────────────

const cardSx = {
  borderRadius: 3,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
} as const;

// ─── Props ───────────────────────────────────────────────────────────────────

export interface BaseDataTableProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  title: string;
  subtitle?: string;
  loadingText?: string;
  onAdd?: () => void;
  addLabel?: string;
  onDeleteRequest?: (row: T) => void;
  canExport?: boolean;
  skeletonRowCount?: number;
  mobileFields?: string[];
  /** Texto localizado do DataGrid */
  localeText?: Record<string, string>;
  /** Rótulo "linhas por página" */
  rowsPerPageLabel?: string;
  /** Função para formatar "de X a Y" da paginação */
  labelDisplayedRows?: (paginationInfo: {
    from: number;
    to: number;
    count: number;
  }) => string;
  /** Opções de tamanho de página */
  pageSizeOptions?: number[];
  /** Se deve esconder o footer (sem paginação do DataGrid) */
  hideFooter?: boolean;
  /** getRowId customizado — default: (row) => row.id */
  getRowId?: (row: T) => string | number;
  children?: React.ReactNode;
}

// ─── StableToolbar ────────────────────────────────────────────────────────────

/** Referência 100% estável — dados chegam via slotProps */
const StableToolbar = TableToolbar;

// ─── Componente ───────────────────────────────────────────────────────────────

export function BaseDataTable<T extends GridValidRowModel>({
  rows,
  columns,
  isLoading,
  isError,
  errorMessage,
  title,
  subtitle,
  loadingText,
  onAdd,
  addLabel,
  canExport = false,
  skeletonRowCount = 8,
  mobileFields,
  localeText,
  rowsPerPageLabel,
  labelDisplayedRows,
  pageSizeOptions = [10, 25, 50],
  hideFooter = false,
  getRowId,
  children,
}: BaseDataTableProps<T>) {
  const theme = useTheme();
  const { palette } = theme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: pageSizeOptions[0] ?? 10 });

  // Filtra colunas no mobile
  const visibleColumns = useMemo(
    () =>
      isMobile && mobileFields
        ? columns.filter((c) => mobileFields.includes(c.field))
        : columns,
    [columns, isMobile, mobileFields],
  );

  // sx dependente de tema — memoizado com deps precisas
  const dataGridSx = useMemo(
    () => ({
      border: 'none',
      '& .MuiDataGrid-columnHeaders': {
        bgcolor: palette.mode === 'dark' ? palette.grey[800] : '#f8f9fa',
        borderBottom: `2px solid ${palette.divider}`,
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 800,
          color: palette.primary.main,
          textTransform: 'uppercase' as const,
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
    }),
    [palette.mode, palette.divider, palette.primary.main, palette.action.hover, palette.grey],
  );

  // ─── Estado de erro ──────────────────────────────────────────────────────

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {errorMessage || 'Erro ao carregar dados.'}
      </Alert>
    );
  }

  // ─── slotProps do toolbar — dados fluem por aqui, não por closure ─────────

  const toolbarSlotProps: TableToolbarProps = {
    onAdd,
    addLabel,
    canExport,
  };

  return (
    <Card elevation={0} sx={cardSx}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {isLoading ? (loadingText ?? 'Carregando...') : (subtitle ?? '')}
          </Typography>
        }
        sx={{ px: 2.5, pt: 2.5, pb: 0 }}
      />

      {children}

      {isLoading ? (
        <TableSkeleton rowCount={skeletonRowCount} />
      ) : (
        <DataGrid<T>
          rows={rows}
          columns={visibleColumns}
          getRowId={getRowId ?? ((row) => (row as any).id)}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={pageSizeOptions}
          localeText={localeText}
          slots={{ toolbar: StableToolbar as unknown as GridSlotsComponent['toolbar'] }}
          slotProps={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toolbar: toolbarSlotProps as any,
            ...(rowsPerPageLabel || labelDisplayedRows
              ? {
                  pagination: {
                    labelRowsPerPage: rowsPerPageLabel,
                    labelDisplayedRows,
                  },
                }
              : {}),
          }}
          disableRowSelectionOnClick
          hideFooter={hideFooter}
          sx={dataGridSx}
        />
      )}
    </Card>
  );
}
