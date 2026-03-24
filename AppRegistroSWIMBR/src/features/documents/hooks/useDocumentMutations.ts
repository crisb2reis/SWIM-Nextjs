/**
 * Módulo: features/documents/hooks/useDocumentMutations.ts
 * Descrição: Custom hook para operações de escrita (create / update / delete).
 */
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { documentService } from '../services/documentService';
import type { DocumentFormValues } from '../types/document.types';

export function useDocumentMutations(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('documents.messages');

  async function create(values: DocumentFormValues): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);
    try {
      await documentService.create(values);
      onSuccess?.();
      return true;
    } catch (e: unknown) {
      setError((e as Error).message ?? t('createError'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function update(
    id: string | number,
    values: DocumentFormValues,
    originalFile?: File | null,
  ): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);
    try {
      await documentService.update(id, values, originalFile);
      onSuccess?.();
      return true;
    } catch (e: unknown) {
      setError((e as Error).message ?? t('updateError'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function remove(id: string | number): Promise<boolean> {
    setIsSubmitting(true);
    setError(null);
    try {
      await documentService.remove(id);
      onSuccess?.();
      return true;
    } catch (e: unknown) {
      setError((e as Error).message ?? t('deleteError'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { create, update, remove, isSubmitting, error };
}
