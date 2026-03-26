'use client';

import { useMemo } from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { ActionsCell } from './ActionsCell';

interface UseTableActionsOptions<T extends GridValidRowModel> {
  onEdit: (row: T) => void;
  onDeleteRequest: (row: T) => void;
  headerName?: string;
  editLabel?: string;
  deleteLabel?: string;
  /** Função que extrai o nome da row para aria-label dinâmico */
  getRowName?: (row: T) => string;
  width?: number;
}

/**
 * Hook genérico para gerar a coluna de ações (Editar/Excluir)
 * com suporte a acessibilidade (aria-label dinâmico).
 */
export function useTableActions<T extends GridValidRowModel>({
  onEdit,
  onDeleteRequest,
  headerName = 'Ações',
  editLabel = 'Editar',
  deleteLabel = 'Excluir',
  getRowName,
  width = 110,
}: UseTableActionsOptions<T>): GridColDef<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(
    () => ({
      field: 'actions',
      headerName,
      width,
      sortable: false,
      filterable: false,
      align: 'center' as const,
      headerAlign: 'center' as const,
      renderCell: ({ row }) => (
        <ActionsCell
          row={row}
          rowName={getRowName?.(row)}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
          editLabel={editLabel}
          deleteLabel={deleteLabel}
        />
      ),
    }),
    [onEdit, onDeleteRequest, headerName, editLabel, deleteLabel, getRowName, width],
  );
}
