'use client';

import { memo } from 'react';
import { Box, Button } from '@mui/material';
import {
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/**
 * Props recebidas via `slotProps.toolbar` do DataGrid.
 * Não use closures — os dados devem fluir por aqui.
 */
export interface TableToolbarProps {
  onAdd?: () => void;
  addLabel?: string;
  canExport?: boolean;
}

const TableToolbar = memo(function TableToolbar({
  onAdd,
  addLabel,
  canExport = false,
}: TableToolbarProps) {
  return (
    <GridToolbarContainer sx={{ p: 1.5, gap: 1, justifyContent: 'space-between' }}>
      {onAdd && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={onAdd}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {addLabel ?? 'Adicionar'}
        </Button>
      )}

      <Box display="flex" gap={1} alignItems="center">
        <Box sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}>
          <GridToolbarQuickFilter />
        </Box>
        {canExport && <GridToolbarExport />}
      </Box>
    </GridToolbarContainer>
  );
});

export { TableToolbar };
