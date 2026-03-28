import useSWR from 'swr';
import { userService } from '../services/user.service';
import { User } from '../types/user.types';

export function useUsers(skip = 0, limit = 100) {
  const { data, error, mutate, isLoading } = useSWR(
    ['/api/v1/users/', skip, limit],
    () => userService.listUsers(skip, limit)
  );

  return {
    users: data || [],
    isLoading,
    isError: !!error,
    errorMessage: error?.response?.data?.detail || error?.message,
    mutate,
  };
}
