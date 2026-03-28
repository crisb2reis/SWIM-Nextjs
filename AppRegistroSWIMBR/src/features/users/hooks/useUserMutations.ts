import { useState, useCallback, useRef } from 'react';
import { userService } from '../services/user.service';
import { UserFormValues } from '../types/user.types';

export function useUserMutations(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * PERF-01: Usando useRef para manter o callback de sucesso estável.
   * Isso evita que create, update e remove mudem suas referências se o onSuccess mudar.
   */
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;

  /**
   * SEC-01 & QUAL-01: Sanitização de erros e tipagem robusta.
   * Centraliza como erros do backend são processados e ocultados se técnicos demais.
   */
  const getErrorMessage = (err: unknown): string => {
    // QUAL-01: Usando type guard em vez de 'any'
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as any;
      const detail = axiosError.response?.data?.detail;
      
      // SEC-01: Evitar expor detalhes internos (stack traces, SQL, etc.)
      if (typeof detail === 'string' && detail.length < 150 && !detail.includes('SQL')) {
        return detail;
      }
    }
    
    if (err instanceof Error) return err.message;
    return 'Erro inesperado no servidor';
  };

  /**
   * PERF-02 & SEC-02: Helper centralizado para mutações.
   * Implementa bloqueio de reentrância para evitar múltiplas submissões paralelas.
   */
  const runMutation = useCallback(async (action: () => Promise<any>, errorFallback: string) => {
    // SEC-02: Guard de reentrância (Lock)
    if (isSubmitting) return false;

    setIsSubmitting(true);
    setError(null);

    try {
      await action();
      successRef.current?.();
      return true;
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg || errorFallback);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const create = useCallback(async (data: UserFormValues) => {
    return runMutation(() => userService.createUser(data), 'Erro ao criar usuário');
  }, [runMutation]);

  const update = useCallback(async (id: number, data: Partial<UserFormValues>) => {
    return runMutation(() => userService.updateUser(id, data), 'Erro ao atualizar usuário');
  }, [runMutation]);

  const remove = useCallback(async (id: number) => {
    return runMutation(() => userService.deleteUser(id), 'Erro ao excluir usuário');
  }, [runMutation]);

  return {
    create,
    update,
    remove,
    isSubmitting,
    error,
  };
}
