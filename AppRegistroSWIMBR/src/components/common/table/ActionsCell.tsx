'use client';

import { memo } from 'react';
import { Box, Tooltip, IconButton, useTheme } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

interface ActionsCellProps<T> {
  row: T;
  rowName?: string;
  onEdit: (row: T) => void;
  onDeleteRequest: (row: T) => void;
  editLabel?: string;
  deleteLabel?: string;
}

/**
 * Célula genérica de ações (Editar / Excluir) com ARIA dinâmico.
 */
const ActionsCell = memo(function ActionsCell<T>({
  row,
  rowName,
  onEdit,
  onDeleteRequest,
  editLabel = 'Editar',
  deleteLabel = 'Excluir',
}: ActionsCellProps<T>) {
  const { palette } = useTheme();

  const editAriaLabel = rowName ? `${editLabel} ${rowName}` : editLabel;
  const deleteAriaLabel = rowName ? `${deleteLabel} ${rowName}` : deleteLabel;

  return (
    <Box display="flex" gap={0.5} justifyContent="center">
      <Tooltip title={editLabel}>
        <IconButton
          size="small"
          onClick={() => onEdit(row)}
          aria-label={editAriaLabel}
          sx={{
            color: palette.primary.main,
            '&:hover': { bgcolor: palette.primary.light },
          }}
        >
          <EditTwoToneIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={deleteLabel}>
        <IconButton
          size="small"
          onClick={() => onDeleteRequest(row)}
          aria-label={deleteAriaLabel}
          sx={{
            color: palette.error.main,
            '&:hover': { bgcolor: palette.error.light },
          }}
        >
          <DeleteTwoToneIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}) as <T>(props: ActionsCellProps<T>) => React.ReactElement;

export { ActionsCell };
export type { ActionsCellProps };
