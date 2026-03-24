/**
 * Módulo: features/documents/services/documentService.ts
 * Descrição: Camada de serviço desacoplada para o domínio de Documentos.
 *            Toda a comunicação com a API REST está centralizada aqui.
 */

import api, { BASE_URL } from '@/lib/axios';
import { AxiosError } from 'axios';
import type { Document, DocumentFormValues } from '../types/document.types';

// ─── Tratamento de erros ───────────────────────────────────────────────────────

// ─── Tratamento de erros ───────────────────────────────────────────────────────

function extractErrorMessage(error: unknown): string {
  const axiosErr = error as AxiosError<Record<string, unknown>>;
  const data = axiosErr.response?.data;

  if (data && typeof data === 'object') {
    if (typeof data['detail'] === 'string') return data['detail'];
    if (Array.isArray(data['non_field_errors'])) return String(data['non_field_errors'][0]);
    const first = Object.values(data)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (typeof first === 'string') return first;
  }

  return axiosErr.message || 'Erro desconhecido';
}

// ─── Resource URL factory ──────────────────────────────────────────────────────

const ENDPOINT = '/api/v1/documents';

// ─── Serviço ───────────────────────────────────────────────────────────────────

const IS_MOCK = typeof window !== 'undefined' && localStorage.getItem('token') === 'fake-dev-token-swimb';

const MOCK_DOCS: Document[] = [
  {
    id: 1,
    title: 'Manual de Operações SWIM',
    publish: 'DECEA',
    date_issued: '2024-01-15',
    version: '1.2.0',
    description: 'Documentação técnica das operações do módulo SWIM.',
    location: 'https://swim.br/docs/manual_operacoes.pdf',
    uploadfile: { file: 'manual_swim.pdf', name: 'manual_swim.pdf' }
  },
  {
    id: 2,
    title: 'Relatório de Registro BR',
    publish: 'ICEA',
    date_issued: '2024-02-10',
    version: '2.0.1',
    description: 'Relatório consolidado de registros anuais.',
    location: 'ICEA São José',
    uploadfile: { file: 'relatorio_2024.pdf', name: 'relatorio_2024.pdf' }
  }
];

export const documentService = {

  /** Lista todos os documentos */
  async list(): Promise<Document[]> {
    if (IS_MOCK) return MOCK_DOCS;
    const { data } = await api.get<{ data: Document[], total: number }>(`${ENDPOINT}/`);
    return Array.isArray(data.data) ? data.data : [];
  },

  /** Busca um documento por ID */
  async getById(id: string | number): Promise<Document> {
    if (IS_MOCK) return MOCK_DOCS.find(d => String(d.id) === String(id)) || MOCK_DOCS[0];
    const { data } = await api.get<Document>(`${ENDPOINT}/${id}/`);
    return data;
  },

  /** Cria um novo documento (suporta upload de arquivo via FormData) */
  async create(values: DocumentFormValues): Promise<Document> {
    if (IS_MOCK) {
      const newDoc = { ...MOCK_DOCS[0], id: Math.random(), title: values.title };
      MOCK_DOCS.push(newDoc);
      return newDoc;
    }
    const body = buildFormData(values);
    const { data } = await api.post<Document>(`${ENDPOINT}/`, body);
    return data;
  },

  /** Atualiza um documento existente */
  async update(id: string | number, values: DocumentFormValues, originalFile?: File | null): Promise<Document> {
    if (IS_MOCK) return MOCK_DOCS[0];
    const body = buildFormData(values);
    // Só reenvia o arquivo se o usuário trocou
    if (values.uploadfile && values.uploadfile !== originalFile) {
      body.append('uploadfile', values.uploadfile);
    }
    const { data } = await api.put<Document>(`${ENDPOINT}/${id}/`, body);
    return data;
  },

  /** Remove um documento */
  async remove(id: string | number): Promise<void> {
    if (IS_MOCK) return;
    await api.delete(`${ENDPOINT}/${id}/`);
  },

  /** Faz download de um arquivo associado ao documento */
  async download(id: string | number): Promise<Blob> {
    if (IS_MOCK) return new Blob(['Mock file content'], { type: 'application/pdf' });
    const { data } = await api.get<Blob>(
      `${ENDPOINT}/${id}/file`,
      { responseType: 'blob' },
    );
    return data;
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildFormData(values: DocumentFormValues): FormData {
  const fd = new FormData();
  fd.append('title',       values.title);
  fd.append('publish',     values.publish);
  if (values.description) fd.append('description', values.description);
  
  // Como são defaults ou não cruciais inicialmente no Pydantic, garantimos que existam se presentes
  if (values.version) fd.append('version', values.version);
  if (values.location) fd.append('location', values.location);
  if (values.date_issued) fd.append('date_issued', values.date_issued);
  
  if (values.uploadfile instanceof File) {
    fd.append('file', values.uploadfile); // FastAPI Pydantic usa UploadFile "file" no form
  }
  return fd;
}

export { extractErrorMessage };
