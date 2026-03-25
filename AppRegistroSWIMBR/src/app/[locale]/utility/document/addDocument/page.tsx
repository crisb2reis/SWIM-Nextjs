'use client';

/**
 * Rota: /utility/document/addDocument
 * Descrição: Página dedicada de adição de documento (alternativa ao dialog modal).
 *             Usa o mesmo DocumentFormDialog em modo standalone.
 */

import { useRouter } from '@/i18n/navigation';
import { useState }  from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import HomeIcon       from '@mui/icons-material/Home';
import ArticleIcon    from '@mui/icons-material/Article';

import dynamic from 'next/dynamic';
import { useDocumentMutations } from '@/features/documents/hooks/useDocumentMutations';
import type { DocumentFormValues } from '@/features/documents/hooks/useDocumentForm';

const DocumentFormDialog = dynamic(
  () => import('@/features/documents/components/DocumentFormDialog').then(mod => mod.DocumentFormDialog),
  { ssr: false }
);

export default function AddDocumentPage() {
  const router  = useRouter();
  const [open]  = useState(true);

  const mutations = useDocumentMutations(() => {
    router.push('/utility/document/documentTable');
  });

  const handleSubmit = async (values: DocumentFormValues) => {
    await mutations.create(values);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink underline="hover" href="/" display="flex" alignItems="center" gap={0.5} color="inherit">
          <HomeIcon fontSize="small" />
          Início
        </MuiLink>
        <MuiLink underline="hover" href="/utility/document/documentTable" color="inherit">
          Documentos
        </MuiLink>
        <Typography color="text.primary" display="flex" alignItems="center" gap={0.5}>
          <ArticleIcon fontSize="small" />
          Novo Documento
        </Typography>
      </Breadcrumbs>

      <DocumentFormDialog
        open={open}
        document={null}
        isSubmitting={mutations.isSubmitting}
        onClose={() => router.push('/utility/document/documentTable')}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
