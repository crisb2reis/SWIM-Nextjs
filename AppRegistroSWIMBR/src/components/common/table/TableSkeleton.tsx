'use client';

import { memo } from 'react';
import { Box, Skeleton } from '@mui/material';

interface TableSkeletonProps {
  rowCount?: number;
}

const TableSkeleton = memo(function TableSkeleton({ rowCount = 8 }: TableSkeletonProps) {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: rowCount }, (_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={52}
          sx={{ mb: 1, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
});

export { TableSkeleton };
