'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormValues } from '../types/user.types';

export type { UserFormValues } from '../types/user.types';

export function useUserForm(defaultValues?: Partial<UserFormValues>) {
  return useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as any, 
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      militar: false,
      ativarUsuario: false,
      tipoUsuario: '',
      organizacao: '',
      tipoAutorizacao: '',
      telefone: '',
      ...defaultValues,
    } as any, 
  });
}
