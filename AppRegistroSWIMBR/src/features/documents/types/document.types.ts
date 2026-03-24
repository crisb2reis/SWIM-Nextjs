/**
 * Módulo: features/documents/types/document.types.ts
 * Descrição: Interfaces e tipos TypeScript fortes para o domínio de Documentos.
 */

// ─── Entidade principal ────────────────────────────────────────────────────────

export interface UploadFile {
  id?: number;
  file?: string;
  url?: string;
  uploadedAt?: string;
  /** O nome original do arquivo (ex: "relatorio.pdf") */
  name?: string;
}

export interface Document {
  id?: string | number;
  title: string;
  publish?: string;
  dateIssued?: string;
  date_issued?: string;
  version?: string;
  description?: string;
  location?: string;
  uploadfile?: UploadFile | null;
}

// ─── DTOs (Data Transfer Objects) ─────────────────────────────────────────────

/** Payload para criação/edição de documento via formulário */
export interface DocumentFormValues {
  title: string;
  description?: string;
  publish: string;
  date_issued: string;
  version: string;
  location: string;
  uploadfile?: File | null;
}

// ─── Resposta genérica da API ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  detail: string;
}

export type DocumentsApiResponse = ApiResponse<Document[]>;
export type DocumentApiResponse  = ApiResponse<Document>;

// ─── Estado do hook ────────────────────────────────────────────────────────────

export type DocumentActionType = 'create' | 'edit' | 'delete' | null;

export interface DocumentDialogState {
  open: boolean;
  action: DocumentActionType;
  document?: Document | null;
}
