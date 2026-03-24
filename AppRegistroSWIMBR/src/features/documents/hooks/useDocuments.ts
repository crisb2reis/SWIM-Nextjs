/**
 * Módulo: features/documents/hooks/useDocuments.ts
 * Descrição: Custom hook para listagem e busca de documentos com cache via SWR.
 */
'use client';

import useSWR from 'swr';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document.types';

const DOCUMENTS_KEY = 'documents/list';

export function useDocuments() {
  const { data, error, isLoading, mutate } = useSWR<Document[]>(
    DOCUMENTS_KEY,
    () => documentService.list(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000, // 1 min
    },
  );

  const sorted = data
    ? [...data].sort((a, b) => a.title.localeCompare(b.title))
    : [];

  return {
    documents: sorted,
    isLoading,
    isError: !!error,
    errorMessage: error?.message as string | undefined,
    mutate,
  };
}
