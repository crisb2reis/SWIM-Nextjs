/**
 * Rota: /utility/document/documentTable
 * Descrição: Página de tabela de documentos (SSR shell + CSR container).
 */
import type { Metadata } from 'next';
import { DocumentsContainer } from '@/features/documents';

export const metadata: Metadata = {
  title: 'Gestão de Documentos | SWIMB',
  description: 'Tabela completa de documentos com busca, filtro e ações CRUD.',
};

export default function DocumentTablePage() {
  return <DocumentsContainer />;
}
