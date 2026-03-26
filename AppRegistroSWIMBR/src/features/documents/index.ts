/**
 * Módulo: features/documents/index.ts
 * Descrição: Public API da feature. Centraliza os exports para evitar
 *             imports deep como '../features/documents/components/DocumentTable'.
 */

// Container
export { DocumentsContainer } from './DocumentsContainer';

// Components
export { DocumentTable }       from './components/DocumentTable';
export { DocumentFormDialog }  from './components/DocumentFormDialog';
export { DocumentViewDialog }  from './components/DocumentViewDialog';
export { DeleteConfirmDialog } from './components/DeleteConfirmDialog';

// Hooks
export { useDocuments }         from './hooks/useDocuments';
export { useDocumentMutations } from './hooks/useDocumentMutations';
export { getDocumentSchema } from './hooks/useDocumentForm';

// Service
export { documentService } from './services/documentService';
export { BASE_URL } from '@/lib/axios';

// Types
export type {
  Document,
  DocumentFormValues,
  UploadFile,
  ApiResponse,
} from './types/document.types';
