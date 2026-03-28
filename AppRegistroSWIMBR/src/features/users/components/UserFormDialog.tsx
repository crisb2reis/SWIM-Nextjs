'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import GroupIcon from '@mui/icons-material/Group';
import { Alert } from '@mui/material';

import { BaseFormDialog } from '@/components/common/BaseFormDialog';
import { useUserForm } from '../hooks/useUserForm';
import { UserForm } from './UserForm';
import { User, UserFormValues } from '../types/user.types';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import { logger } from '@/lib/logger';

// ─── Props ───────────────────────────────────────────────────────────────────

interface UserFormDialogProps {
  open: boolean;
  user: User | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const DEFAULT_VALUES: UserFormValues = {
  nome: '',
  email: '',
  senha: '',
  militar: false,
  ativarUsuario: false,
  tipoUsuario: '',
  organizacao: '',
  tipoAutorizacao: '',
  telefone: '',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserFormDialog({
  open,
  user,
  isSubmitting,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const t = useTranslations('registration');
  const commonT = useTranslations('common');
  const actionT = useTranslations('actions');

  const isEditing = !!user;

  // SEC-04 & PERF-01: Usando hook centralizado com SWR para cache e controle de ciclo de vida
  const { organizations, isLoading: isLoadingOrgs } = useOrganizations();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useUserForm();

  // INC-01: Usando DEFAULT_VALUES para evitar duplicação de lógica (DRY)
  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      if (user) {
        reset({
          ...DEFAULT_VALUES,
          nome: user.nome || '',
          email: user.email || '',
          militar: user.is_military || false,
          ativarUsuario: user.is_active || false,
          tipoUsuario: user.user_type || '',
          organizacao: user.organization_id?.toString() || '',
          tipoAutorizacao: user.user_level_auth || '',
          telefone: user.phone_number || '',
          // senha permanece '' de DEFAULT_VALUES pois não deve ser pré-preenchida
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [open, user, reset]);

  const handleSave = useCallback(
    handleSubmit(
      async (values) => {
        setErrorMsg(null);
        try {
          await onSubmit(values);
        } catch (err: unknown) {
          // INC-02: Exibindo erro específico da API se disponível
          const msg = (err as any)?.response?.data?.detail || commonT('messages.error');
          setErrorMsg(msg);
        }
      },
      (validationErrors) => {
        // Logar falhas de validação para análise de UX
        logger.error('Falha na validação do formulário de usuário', null, {
          event_type: 'FRONTEND_VALIDATION_ERROR',
          action: isEditing ? 'UPDATE_USER_VALIDATION' : 'CREATE_USER_VALIDATION',
          metadata: {
            invalidFields: Object.keys(validationErrors),
            errors: Object.entries(validationErrors).map(([field, err]) => ({
              field,
              message: err?.message,
              type: err?.type
            }))
          }
        });
      }
    ),
    [handleSubmit, onSubmit, commonT, isEditing]
  );

  // Removido hoisting problemático (isEditing movido para o topo do componente)

  /**
   * QUAL-02: Títulos e labels internacionalizados, removendo strings hardcoded.
   * SEC-01: Null-safe check para o nome do usuário.
   */
  const title = isEditing ? t('editTitle') : t('title');
  const subtitle = isEditing 
    ? t('editSubtitle', { name: user?.nome || 'Usuário' }) 
    : t('subtitle');
  const saveLabel = isEditing ? t('saveChanges') : t('title');
  const savingLabel = commonT('loading'); // Consolidado (NOVO-01)

  return (
    <BaseFormDialog
      open={open}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onClose={onClose}
      onSave={handleSave}
      icon={<GroupIcon />} 
      title={title}
      subtitle={subtitle}
      discardLabel={actionT('cancel')}
      saveLabel={saveLabel}
      savingLabel={savingLabel}
      dialogId="user-form-dialog"
    >
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <UserForm 
        control={control}
        errors={errors}
        organizations={organizations}
        isLoadingOrgs={isLoadingOrgs} // INC-03: Passando estado de carregamento
      />
    </BaseFormDialog>
  );
}
