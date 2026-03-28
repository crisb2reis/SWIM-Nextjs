'use client';

import { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import {
  Grid,
  Alert,
  Autocomplete,
  TextField,
  InputAdornment,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import PhoneIcon from '@mui/icons-material/Phone';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { useTranslations } from 'next-intl';

import { useContactPointForm, type ContactPointFormValues } from '../hooks/useContactPointForm';
import type { ContactPoint } from '../types/contact.types';
import type { Organization } from '@/features/organizations/types/organization.types';
import { BaseFormDialog } from '@/components/common/BaseFormDialog';
import { FormField } from '@/components/common/FormField';
import { logger } from '@/lib/logger';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContactPointFormDialogProps {
  open: boolean;
  contact?: ContactPoint | null;
  organizations: Organization[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ContactPointFormValues) => Promise<void>;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ContactPointFormDialog({
  open,
  contact,
  organizations,
  isSubmitting,
  onClose,
  onSubmit,
}: ContactPointFormDialogProps) {
  const t = useTranslations('contacts');
  const isEditing = !!contact;

  const { control, handleSubmit, setError, formState: { errors } } =
    useContactPointForm(contact ?? undefined);

  // Fecha o ciclo de submit com tratamento de erro global
  const handleSave = useCallback(
    handleSubmit(
      async (values) => {
        try {
          await onSubmit(values);
        } catch {
          setError('root', { message: t('messages.submitError') });
        }
      },
      (validationErrors) => {
        logger.error('Falha na validação do formulário de Ponto de Contato', null, {
          event_type: 'FRONTEND_VALIDATION_ERROR',
          action: isEditing ? 'UPDATE_CONTACT_VALIDATION' : 'CREATE_CONTACT_VALIDATION',
          metadata: {
            invalidFields: Object.keys(validationErrors),
            errors: Object.entries(validationErrors).map(([field, err]) => ({
              field,
              message: err?.message,
              type: err?.type,
            })),
          },
        });
      },
    ),
    [handleSubmit, onSubmit, setError, t, isEditing],
  );

  return (
    // key força remount quando a entidade muda → elimina o useEffect + reset
    <BaseFormDialog
      key={contact?.id ?? 'new'}
      open={open}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onClose={onClose}
      onSave={handleSave}
      icon={isEditing ? <SaveIcon /> : <PersonIcon />}
      title={isEditing ? (contact?.name ?? '') : t('newContact')}
      subtitle={isEditing ? t('messages.editSubtitle') : t('messages.addSubtitle')}
      discardLabel={t('messages.discard')}
      saveLabel={isEditing ? t('messages.saveChanges') : t('messages.create')}
      dialogId="contact-form-dialog"
    >
      {errors.root && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.root.message}
        </Alert>
      )}

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <FormField
            name="name"
            control={control}
            label={`${t('form.nameLabel')} *`}
            placeholder={t('form.namePlaceholder')}
            icon={<PersonIcon />}
            error={errors.name}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormField
            name="email"
            control={control}
            label={`${t('form.emailLabel')} *`}
            placeholder={t('form.emailPlaceholder')}
            icon={<EmailIcon />}
            error={errors.email}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="role"
            control={control}
            label={t('form.roleLabel')}
            placeholder={t('form.rolePlaceholder')}
            icon={<WorkIcon />}
            error={errors.role}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormField
            name="phone"
            control={control}
            label={t('form.phoneLabel')}
            placeholder={t('form.phonePlaceholder')}
            icon={<PhoneIcon />}
            error={errors.phone}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <OrgAutocomplete
            control={control}
            organizations={organizations}
            error={errors.organization_id?.message}
            label={`${t('form.organizationLabel')} *`}
            placeholder={t('form.organizationPlaceholder')}
          />
        </Grid>
      </Grid>
    </BaseFormDialog>
  );
}

// ─── Sub-componente isolado: regras de hooks respeitadas ──────────────────────

interface OrgAutocompleteProps {
  control: ReturnType<typeof useContactPointForm>['control'];
  organizations: Organization[];
  error?: string;
  label: string;
  placeholder: string;
}

function OrgAutocomplete({
  control,
  organizations,
  error,
  label,
  placeholder,
}: OrgAutocompleteProps) {
  return (
    <Controller
      name="organization_id"
      control={control}
      render={({ field: { value, onChange } }) => (
        <OrgAutocompleteInner
          value={value}
          onChange={onChange}
          organizations={organizations}
          error={error}
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  );
}

interface OrgAutocompleteInnerProps {
  value: number;
  onChange: (id: number) => void;
  organizations: Organization[];
  error?: string;
  label: string;
  placeholder: string;
}

function getOrgId(val: Organization | number | null): number | null {
  if (val == null) return null;
  return typeof val === 'number' ? val : val.id;
}

function OrgAutocompleteInner({
  value,
  onChange,
  organizations,
  error,
  label,
  placeholder,
}: OrgAutocompleteInnerProps) {
  // useMemo num componente real — regras de hooks respeitadas
  const selected = useMemo(
    () => organizations.find((o) => o.id === value) ?? null,
    [organizations, value],
  );

  return (
    <Autocomplete
      options={organizations}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(o, val) => o.id === getOrgId(val as any)}
      value={selected}
      onChange={(_, newValue) => onChange(newValue?.id ?? 0)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <CorporateFareIcon color="primary" fontSize="small" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
