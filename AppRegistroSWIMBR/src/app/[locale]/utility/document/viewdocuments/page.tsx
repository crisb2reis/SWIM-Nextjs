'use client';

/**
 * Rota: /utility/document (galeria de cards — equivalente ao viewDocuments)
 * Descrição: Visualização em cards (grid layout) de todos os documentos.
 *             Inclui busca por título/publicador e download de arquivo.
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Link,
  Button,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import SearchIcon      from '@mui/icons-material/Search';
import DownloadIcon    from '@mui/icons-material/Download';
import ArticleIcon     from '@mui/icons-material/Article';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Link as NextLink } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import { useDocuments }       from '@/features/documents/hooks/useDocuments';
import { documentService }    from '@/features/documents/services/documentService';
import type { Document }      from '@/features/documents/types/document.types';

const DocumentViewDialog  = dynamic(() => import('@/features/documents/components/DocumentViewDialog').then(mod => mod.DocumentViewDialog), { ssr: false });

// ─── Card individual ──────────────────────────────────────────────────────────

function DocumentCard({ doc, onView }: { doc: Document; onView: (d: Document) => void }) {
  const theme = useTheme();
  const t = useTranslations('documents');

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const filename = String(doc.uploadfile?.file ?? '').split('/').pop() ?? '';
    if (!filename) return;
    try {
      const blob = await documentService.download(filename);
      const url  = window.URL.createObjectURL(blob);
      const docEl    = window.document.createElement('a');
      docEl.href     = url;
      docEl.download = filename;
      window.document.body.appendChild(docEl);
      docEl.click();
      docEl.remove();
      window.URL.revokeObjectURL(url);
    } catch {/* ignore */ }
  };

  return (
    <Card
      elevation={0}
      onClick={() => onView(doc)}
      sx={{
        height: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        transition: 'all .25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: theme.palette.primary.light,
        },
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArticleIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {doc.title}
          </Typography>
        }
        subheader={
          doc.version && (
            <Chip
              label={`v${doc.version}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 0.5, fontSize: 10, height: 18, fontWeight: 700 }}
            />
          )
        }
        sx={{ pb: 0 }}
      />

      <CardContent sx={{ flexGrow: 1, pt: 1 }}>
        {doc.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
            {doc.description.length > 120
              ? `${doc.description.slice(0, 120)}…`
              : doc.description}
          </Typography>
        )}

        <Box display="flex" flexDirection="column" gap={0.5}>
          {doc.publish && (
            <Typography variant="caption" color="text.secondary">
              <strong>{t('labels.publisher')}:</strong> {doc.publish}
            </Typography>
          )}
          {(doc.dateIssued || doc.date_issued) && (
            <Typography variant="caption" color="text.secondary">
              <strong>{t('gallery.issue')}:</strong> {doc.dateIssued ?? doc.date_issued}
            </Typography>
          )}
          {doc.location && (
            <Link
              href={doc.location}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              onClick={(e) => e.stopPropagation()}
              sx={{ mt: 0.5 }}
            >
              {t('gallery.access')}
            </Link>
          )}
        </Box>

        {doc.uploadfile && (
          <Button
            size="small"
            variant="text"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleDownload}
            sx={{ mt: 1, p: 0, textTransform: 'none', fontSize: 12 }}
          >
            {t('gallery.download')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Skeleton de card ─────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2 }}>
      <Skeleton variant="rectangular" height={40} width={40} sx={{ borderRadius: 2, mb: 1.5 }} />
      <Skeleton width="70%" height={20} />
      <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
      <Skeleton width="90%" height={14} sx={{ mt: 2 }} />
      <Skeleton width="60%" height={14} sx={{ mt: 0.5 }} />
    </Card>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ViewDocumentsPage() {
  const t = useTranslations('documents');
  const n = useTranslations('navigation');
  const { documents, isLoading, isError, errorMessage } = useDocuments();
  const searchParams = useSearchParams();
  
  // O termo de busca agora vem primordialmente da URL (global search)
  const globalSearch = searchParams.get('q') || '';
  const [localSearch, setLocalSearch] = useState('');
  
  // Estado para visualização do documento no Dialog
  const [viewDoc, setViewDoc] = useState<Document | null>(null);

  const filtered = useMemo(() => {
    if (!documents) return [];
    
    // Prioriza o busca global, mas permite busca local complementar se desejar
    const q = (globalSearch || localSearch).toLowerCase();
    
    if (!q) return documents;
    
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.publish?.toLowerCase().includes(q) ||
        (d.dateIssued ?? d.date_issued)?.includes(q),
    );
  }, [documents, globalSearch, localSearch]);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Cabeçalho */}
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {globalSearch 
              ? t('resultsFor', { query: globalSearch }) 
              : t('gallerySubtitle')}
          </Typography>
        </Box>

        <Box display="flex" gap={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder={t('filterOnPage')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />
          <Button
            component={NextLink}
            href="/utility/document/documentTable"
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            {n('manage')}
          </Button>
        </Box>
      </Box>

      {/* Erro */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage ?? t('gallery.loadError')}
        </Alert>
      )}

      {/* Grid de cards */}
      <Grid container spacing={2.5}>
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                <CardSkeleton />
              </Grid>
            ))
          : filtered.map((doc) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={doc.id}>
                <DocumentCard doc={doc} onView={setViewDoc} />
              </Grid>
            ))}

        {!isLoading && filtered.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box textAlign="center" py={8} color="text.secondary">
              <ArticleIcon sx={{ fontSize: 64, opacity: 0.3, mb: 1 }} />
              <Typography variant="h6">{t('noDocsFound')}</Typography>
              <Typography variant="body2">{t('gallery.noResultsHint')}</Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Dialog de visualização aprofundada */}
      <DocumentViewDialog
        open={!!viewDoc}
        document={viewDoc}
        onClose={() => setViewDoc(null)}
      />
    </Box>
  );
}
