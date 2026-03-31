import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../user.service';
import type { UserFormValues, User } from '@/features/users/types/user.types';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/lib/axios';

const mockApi = vi.mocked(api);

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userData: UserFormValues = {
        nome: 'John Doe',
        email: 'john@example.com',
        senha: 'password123',
        militar: true,
        ativarUsuario: true,
        tipoUsuario: 'admin',
        tipoAutorizacao: 'full',
        telefone: '+55-11-99999-9999',
        organizacao: '1',
      };

      const mockResponse: User = {
        id: 1,
        username: 'john@example.com',
        email: 'john@example.com',
        nome: 'John Doe',
        phone_number: '+55-11-99999-9999',
        user_type: 'admin',
        user_level_auth: 'full',
        is_active: true,
        is_military: true,
        organization_id: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await userService.createUser(userData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/users/', {
        username: userData.email,
        email: userData.email,
        password: userData.senha,
        nome: userData.nome,
        phone_number: userData.telefone,
        user_type: userData.tipoUsuario,
        user_level_auth: userData.tipoAutorizacao,
        is_military: userData.militar,
        is_active: userData.ativarUsuario,
        organization_id: 1,
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve criar usuário sem organização', async () => {
      const userData: UserFormValues = {
        nome: 'Jane Doe',
        email: 'jane@example.com',
        senha: 'password123',
        militar: false,
        ativarUsuario: false,
        tipoUsuario: 'user',
        tipoAutorizacao: 'limited',
      };

      const mockResponse: User = {
        id: 2,
        username: 'jane@example.com',
        email: 'jane@example.com',
        nome: 'Jane Doe',
        user_type: 'user',
        user_level_auth: 'limited',
        is_active: false,
        is_military: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await userService.createUser(userData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/users/', expect.objectContaining({
        organization_id: null,
      }));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateUser', () => {
    it('deve atualizar usuário com dados parciais', async () => {
      const updateData: Partial<UserFormValues> = {
        nome: 'John Updated',
        telefone: '+55-11-88888-8888',
        militar: false,
      };

      const mockResponse: User = {
        id: 1,
        username: 'john@example.com',
        email: 'john@example.com',
        nome: 'John Updated',
        phone_number: '+55-11-88888-8888',
        user_type: 'admin',
        user_level_auth: 'full',
        is_active: true,
        is_military: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      mockApi.put.mockResolvedValue({ data: mockResponse });

      const result = await userService.updateUser(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/users/1', {
        nome: 'John Updated',
        phone_number: '+55-11-88888-8888',
        is_military: false,
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve atualizar senha do usuário', async () => {
      const updateData: Partial<UserFormValues> = {
        senha: 'newpassword456',
      };

      const mockResponse: User = {
        id: 1,
        username: 'john@example.com',
        email: 'john@example.com',
        nome: 'John Doe',
        user_type: 'admin',
        user_level_auth: 'full',
        is_active: true,
        is_military: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      mockApi.put.mockResolvedValue({ data: mockResponse });

      await userService.updateUser(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/users/1', {
        password: 'newpassword456',
      });
    });

    it('deve atualizar organização', async () => {
      const updateData: Partial<UserFormValues> = {
        organizacao: '5',
      };

      mockApi.put.mockResolvedValue({ data: {} as User });

      await userService.updateUser(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/users/1', {
        organization_id: 5,
      });
    });

    it('deve atualizar is_active', async () => {
      const updateData: Partial<UserFormValues> = {
        ativarUsuario: true,
      };

      mockApi.put.mockResolvedValue({ data: {} as User });

      await userService.updateUser(1, updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/api/v1/users/1', {
        is_active: true,
      });
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário', async () => {
      mockApi.delete.mockResolvedValue({});

      await userService.deleteUser(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/users/1');
    });

    it('deve não lançar erro ao deletar', async () => {
      mockApi.delete.mockResolvedValue({});

      await expect(userService.deleteUser(1)).resolves.not.toThrow();
    });
  });

  describe('listUsers', () => {
    it('deve listar usuários com paginação default', async () => {
      const mockUsers: User[] = [
        { id: 1, username: 'user1', email: 'user1@example.com', nome: 'User 1', user_type: 'user', user_level_auth: 'limited', is_active: true, is_military: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, username: 'user2', email: 'user2@example.com', nome: 'User 2', user_type: 'user', user_level_auth: 'limited', is_active: true, is_military: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ];

      mockApi.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.listUsers();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/', {
        params: { skip: 0, limit: 100 },
      });
      expect(result).toEqual(mockUsers);
    });

    it('deve listar usuários com paginação customizada', async () => {
      const mockUsers: User[] = [
        { id: 1, username: 'user1', email: 'user1@example.com', nome: 'User 1', user_type: 'user', user_level_auth: 'limited', is_active: true, is_military: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
      ];

      mockApi.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.listUsers(10, 25);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/', {
        params: { skip: 10, limit: 25 },
      });
      expect(result).toEqual(mockUsers);
    });
  });
});