'use client';

import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormValues, type UserFormInput } from '../types/user.types';

export type { UserFormValues } from '../types/user.types';

export function useUserForm(defaultValues?: Partial<UserFormInput>): UseFormReturn<UserFormValues> {
  return useForm<UserFormValues>({
    resolver: zodResolver(userSchema) as Resolver<UserFormValues>,
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
    },
  });
}
