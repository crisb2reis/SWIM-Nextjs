/**
 * features/services/types/service.types.ts
 * Interfaces e types para o domínio de Serviços SWIM.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ServiceStatus        = 'EM_APROVACAO' | 'ATIVO' | 'INATIVO' | 'SUSPENSO';
export type ServiceLifeCycle     = 'PROPOSTA'     | 'CANDIDATO' | 'OPERACIONAL' | 'LEGADO' | 'RETIRADO';
export type ServiceTipo          = 'REST'         | 'SOAP'  | 'FTP'    | 'AMHS'   | 'OUTRO';
export type ServicePublishStatus = 'PUBLICADO'    | 'RASCUNHO' | 'INATIVO';

// ─── Entidade principal ────────────────────────────────────────────────────────

export interface Service {
  id: number;
  name: string;
  organization?: string | null;
  version?: string | null;
  status?: ServiceStatus | null;
  life_cycle?: ServiceLifeCycle | null;
  tipo?: ServiceTipo | null;
  publish_status?: ServicePublishStatus | null;
  created_at?: string | null;
}

// ─── Formulário ───────────────────────────────────────────────────────────────

export interface ServiceFormValues {
  name: string;
  organization: string;
  version: string;
  status: ServiceStatus | '';
  life_cycle: ServiceLifeCycle | '';
  tipo: ServiceTipo | '';
  publish_status: ServicePublishStatus | '';
}
