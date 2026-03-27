'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import GroupIcon from '@mui/icons-material/Group';
import { Alert, Snackbar } from '@mui/material';

import { BaseFormDialog } from '@/components/common/BaseFormDialog';
import { useUserForm } from '../hooks/useUserForm';
import { UserForm } from './UserForm';
import type { UserFormValues } from '../types/user.types';
import type { GenericFormDialogProps } from '@/components/common/AddEntityPage';
import { userService } from '../services/user.service';
import { organizationService } from '@/features/organizations/services/organizationService';
import type { Organization } from '@/features/organizations/types/organization.types';
import { useEffect } from 'react';

// ─── Componente ───────────────────────────────────────────────────────────────

export function UserFormDialog({
  open,
  isSubmitting: externalIsSubmitting,
  onClose,
  onSubmit: externalOnSubmit,
}: GenericFormDialogProps<UserFormValues>) {
  const t = useTranslations('registration');
  const commonT = useTranslations('common');
  const actionT = useTranslations('actions');

  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Carregar organizações
  useEffect(() => {
    if (open) {
      organizationService.list()
        .then(setOrganizations)
        .catch(err => console.error('Error fetching organizations:', err));
    }
  }, [open]);

  const { control, handleSubmit, reset, formState: { errors } } = useUserForm();

  const isSubmitting = externalIsSubmitting || localIsSubmitting;

  const handleSave = useCallback(
    handleSubmit(async (values) => {
      setLocalIsSubmitting(true);
      setErrorMsg(null);
      try {
        // Integração real com o backend
        await userService.createUser(values);
        
        setSuccessOpen(true);
        reset(); // Limpa o formulário
        
        // Se houver um callback externo (para atualizar lista, p. ex.)
        if (externalOnSubmit) {
          await externalOnSubmit(values);
        }

        // Fecha o diálogo após um breve delay para mostrar o sucesso
        setTimeout(() => {
          onClose();
        }, 1500);

      } catch (err: any) {
        console.error('Registration error:', err);
        const detail = err.response?.data?.detail;
        setErrorMsg(typeof detail === 'string' ? detail : t('error'));
      } finally {
        setLocalIsSubmitting(false);
      }
    }),
    [handleSubmit, externalOnSubmit, onClose, reset, t],
  );

  return (
    <>
      <BaseFormDialog
        open={open}
        isSubmitting={isSubmitting}
        isEditing={false}
        onClose={onClose}
        onSave={handleSave}
        icon={<GroupIcon />} 
        title={t('title')}
        subtitle={t('subtitle')}
        discardLabel={actionT('cancel')}
        saveLabel={t('title')}
        savingLabel={commonT('loading')}
        dialogId="user-registration-dialog"
      >
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <UserForm 
          control={control as any}
          errors={errors}
          organizations={organizations}
        />
      </BaseFormDialog>

      <Snackbar 
        open={successOpen} 
        autoHideDuration={4000} 
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {t('success')}
        </Alert>
      </Snackbar>
    </>
  );
}
