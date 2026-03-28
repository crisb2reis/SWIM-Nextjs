import api from '@/lib/axios';
import { User, UserFormValues } from '../types/user.types';

export const userService = {
  /**
   * Cria um novo usuário no sistema.
   */
  async createUser(data: UserFormValues): Promise<User> {
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

    const response = await api.post<User>('/api/v1/users/', payload);
    return response.data;
  },

  /**
   * Atualiza um usuário existente.
   */
  async updateUser(id: number, data: Partial<UserFormValues>): Promise<User> {
    const payload: any = {};
    if (data.nome) payload.nome = data.nome;
    if (data.telefone) payload.phone_number = data.telefone;
    if (data.tipoUsuario) payload.user_type = data.tipoUsuario;
    if (data.tipoAutorizacao) payload.user_level_auth = data.tipoAutorizacao;
    if (data.militar !== undefined) payload.is_military = data.militar;
    if (data.ativarUsuario !== undefined) payload.is_active = data.ativarUsuario;
    if (data.organizacao) payload.organization_id = parseInt(data.organizacao);
    if (data.senha) payload.password = data.senha;

    const response = await api.put<User>(`/api/v1/users/${id}`, payload);
    return response.data;
  },

  /**
   * Exclui um usuário.
   */
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/api/v1/users/${id}`);
  },

  /**
   * Lista usuários com paginação opcional.
   */
  async listUsers(skip = 0, limit = 100): Promise<User[]> {
    const response = await api.get<User[]>('/api/v1/users/', {
      params: { skip, limit },
    });
    return response.data;
  },
};
