'use client';

import { memo } from 'react';
import { Chip, Typography } from '@mui/material';

interface OrgChipCellProps {
  name?: string | null;
}

const OrgChipCell = memo(function OrgChipCell({ name }: OrgChipCellProps) {
  if (!name) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  return (
    <Chip
      label={name}
      size="small"
      variant="outlined"
      sx={{ fontStyle: 'italic', color: 'text.secondary' }}
    />
  );
});

export { OrgChipCell };
