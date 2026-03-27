import api from '@/lib/axios';
import { UserFormValues } from '../types/user.types';

export interface UserRead {
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
  created_at: string;
  updated_at: string;
}

export const userService = {
  /**
   * Cria um novo usuário no sistema.
   * Mapeia os campos do formulário para os campos esperados pelo backend.
   */
  async createUser(data: UserFormValues): Promise<UserRead> {
    // Mapeamento de campos do formulário para o backend (snake_case)
    const payload = {
      username: data.email, 
      email: data.email,
      password: data.senha,
      nome: data.nome,
      phone_number: data.telefone,
      user_type: data.tipoUsuario,
      user_level_auth: data.tipoAutorizacao,
      is_military: data.militar,
      is_active: data.ativarUsuario,
      organization_id: data.organizacao ? parseInt(data.organizacao) : null,
    };

    const response = await api.post<UserRead>('/api/v1/users/', payload);
    return response.data;
  },

  /**
   * Lista usuários com paginação opcional.
   */
  async listUsers(skip = 0, limit = 100): Promise<UserRead[]> {
    const response = await api.get<UserRead[]>('/api/v1/users/', {
      params: { skip, limit },
    });
    return response.data;
  },
};
