'use client';

import { memo } from 'react';
import { Box, Button } from '@mui/material';
import {
  GridToolbarQuickFilter,
  GridToolbarContainer,
  GridToolbarExport,
  type GridToolbarProps,
} from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

/**
 * Props recebidas via `slotProps.toolbar` do DataGrid.
 * Não use closures — os dados devem fluir por aqui.
 * 
 * Estende Partial<GridToolbarProps> para aceitar props extras
 * que o DataGrid injeta automaticamente, sem quebrar tipagem.
 * 
 * LAYOUT (UX-01):
 * - Quando `onAdd` é undefined: justifyContent='flex-end' (busca/export à direita)
 * - Quando `onAdd` está presente: justifyContent='space-between' (distribuído)
 * 
 * EXPORT (SEC-03):
 * - printOptions={{ disableToolbarButton: true }}: desabilita Print, apenas CSV
 * - csvOptions={{ utf8WithBom: true }}: compatibilidade com Excel/BR
 * - Restringe formatos por privacidade (logs contêm IPs, emails)
 */
export interface TableToolbarProps extends Partial<GridToolbarProps> {
  onAdd?: () => void;
  addLabel?: string;
  canExport?: boolean;
}

const TableToolbar = memo(function TableToolbar({
  onAdd,
  addLabel,
  canExport = false,
}: TableToolbarProps) {
  const tCommon = useTranslations('common.table');

  return (
    <GridToolbarContainer sx={{ 
      p: 1.5, 
      gap: 1, 
      justifyContent: onAdd ? 'space-between' : 'flex-end',
    }}>
      {onAdd && (
        <Button
          variant="contained"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={onAdd}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {addLabel ?? tCommon('addLabel')}
        </Button>
      )}

      <Box display="flex" gap={1} alignItems="center">
        <Box sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}>
          <GridToolbarQuickFilter />
        </Box>
        {canExport && (
          <GridToolbarExport
            printOptions={{ disableToolbarButton: true }}
            csvOptions={{ utf8WithBom: true }}
          />
        )}
      </Box>
    </GridToolbarContainer>
  );
});

export { TableToolbar };
