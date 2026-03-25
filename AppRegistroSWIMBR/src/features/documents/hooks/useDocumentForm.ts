/**
 * Módulo: features/documents/hooks/useDocumentForm.ts
 * Descrição: Hook que centraliza a lógica do formulário (RHF + Zod).
 */
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import type { Document } from '../types/document.types';

// ─── Schema Zod Factory ───────────────────────────────────────────────────────

export const getDocumentSchema = (t: ReturnType<typeof useTranslations<'documents'>>) => z.object({
  title: z
    .string()
    .min(1, t('validation.titleRequired'))
    .max(120, t('validation.titleMax')),
  description: z.string().max(1000, t('validation.descriptionMax')).optional(),
  publish: z
    .string()
    .min(1, t('validation.publisherRequired'))
    .max(100, t('validation.publisherMax'))
    .regex(
      /^[a-zA-ZÀ-žÀ-ÿ0-9\s\-\.\,\(\)&]+$/,
      t('validation.publisherInvalid'),
    ),
  date_issued: z
    .string()
    .min(1, t('validation.dateRequired'))
    .max(10, t('validation.dateInvalid')),
  version: z
    .string()
    .min(1, t('validation.versionRequired'))
    .regex(/^\d+\.\d+\.\d+$/, t('validation.versionFormat')),
  location: z
    .string()
    .min(1, t('validation.locationRequired'))
    .max(200, t('validation.locationMax'))
    .url(t('validation.urlInvalid')),
  uploadfile: z.instanceof(File).optional().nullable(),
});

export type DocumentFormValues = z.infer<ReturnType<typeof getDocumentSchema>>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDocumentForm(defaultValues?: Partial<Document>) {
  const t = useTranslations('documents');
  const schema = getDocumentSchema(t);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       defaultValues?.title       ?? '',
      description: defaultValues?.description ?? '',
      publish:     defaultValues?.publish     ?? '',
      date_issued: defaultValues?.dateIssued  ?? defaultValues?.date_issued ?? '',
      version:     defaultValues?.version     ?? '',
      location:    defaultValues?.location    ?? '',
      uploadfile:  null,
    },
    mode: 'onBlur',
  });

  return form;
}
