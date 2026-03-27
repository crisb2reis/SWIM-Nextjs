import { z } from 'zod';

export const userSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  militar: z.boolean().default(false),
  ativarUsuario: z.boolean().default(false),
  tipoUsuario: z.string().min(1, 'Tipo de usuário é obrigatório'),
  organizacao: z.string().optional(),
  tipoAutorizacao: z.string().min(1, 'Tipo de autorização é obrigatório'),
  telefone: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;
