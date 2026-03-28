import { z } from 'zod';
import type { Organization } from '@/features/organizations/types/organization.types';

export const userSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  senha: z.string().refine((val) => val === '' || val.length >= 6, {
    message: 'A senha deve ter pelo menos 6 caracteres',
  }).optional(),
  militar: z.boolean().default(false),
  ativarUsuario: z.boolean().default(false),
  tipoUsuario: z.string().min(1, 'Tipo de usuário é obrigatório'),
  organizacao: z.string().optional(),
  tipoAutorizacao: z.string().min(1, 'Tipo de autorização é obrigatório'),
  telefone: z.string().optional(),
});

/** Representa a saída do esquema (dados sanitizados) */
export type UserFormValues = z.infer<typeof userSchema>;

/** Representa a entrada do esquema (para valores iniciais/defaultValues) */
export type UserFormInput = z.input<typeof userSchema>;

export interface User {
  id: number;
  username: string;
  email: string;
  nome: string;
  phone_number?: string;
  user_type: string;
  user_level_auth: string;
  is_active: boolean;
  is_military: boolean;
  organization_id?: number;
  organization?: Organization;
  created_at: string;
  updated_at: string;
}
