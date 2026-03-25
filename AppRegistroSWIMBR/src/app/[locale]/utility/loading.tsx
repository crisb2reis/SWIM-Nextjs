'use client';

import { Box, Card, Skeleton, Container } from '@mui/material';

export default function LoadingUtility() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Skeleton for Header & Breadcrumbs */}
      <Box mb={4}>
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={56} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} />
      </Box>

      {/* Skeleton for DataGrid/Table Area */}
      <Card sx={{ borderRadius: 2, p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width={180} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        
        {/* Table Rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ bgcolor: 'action.hover' }} />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={52} />
          ))}
        </Box>
      </Card>
    </Container>
  );
}
