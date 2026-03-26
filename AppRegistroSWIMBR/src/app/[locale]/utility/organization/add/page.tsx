'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import BusinessIcon from '@mui/icons-material/Business';
import { CircularProgress } from '@mui/material';

import {
  organizationService,
  parseOrganizationError,
} from '@/features/organizations/services/organizationService';
import { AddEntityPage, type GenericFormDialogProps } from '@/components/common/AddEntityPage';
import type { OrganizationFormValues } from '@/features/organizations/types/organization.types';
import { ROUTES } from '@/lib/routes';

// Loading fallback para o diálogo dinâmico
const OrganizationFormDialog = dynamic(
  () => import('@/features/organizations/components/OrganizationFormDialog').then(mod => mod.OrganizationFormDialog),
  { 
    ssr: false,
    loading: () => <CircularProgress size={24} />
  }
);

// Adapter para evitar a criação de funções anônimas no render
const OrganizationDialogAdapter = (props: GenericFormDialogProps<OrganizationFormValues>) => (
  <OrganizationFormDialog {...props} organization={null} />
);

export default function OrganizationAddPage() {
  const t = useTranslations('organizations');

  // Contrato simplificado: retorna a Promise transformada via .catch()
  const handleSubmit = (values: OrganizationFormValues) => 
    organizationService.create(values).catch((err) => {
      throw parseOrganizationError(err);
    });

  return (
    <AddEntityPage
      breadcrumbs={[
        { label: t('title'), href: ROUTES.organizations.manage },
        { label: t('newOrganization'), active: true, icon: <BusinessIcon fontSize="small" /> },
      ]}
      title={t('newOrganization')}
      subtitle={t('messages.addSubtitle')}
      successMessage={t('messages.created')}
      redirectRoute={ROUTES.organizations.manage}
      onSubmit={handleSubmit}
      FormDialog={OrganizationDialogAdapter}
    />
  );
}
