'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import { CircularProgress } from '@mui/material';

import { serviceService, extractServiceErrorMessage } from '@/features/services/services/serviceService';
import { AddEntityPage, type GenericFormDialogProps } from '@/components/common/AddEntityPage';
import type { ServiceFormValues } from '@/features/services/types/service.types';
import { ROUTES } from '@/lib/routes';

// Loading fallback para o diálogo dinâmico
const ServiceFormDialog = dynamic(
  () => import('@/features/services/components/ServiceFormDialog').then((mod) => mod.ServiceFormDialog),
  { 
    ssr: false,
    loading: () => <CircularProgress size={24} />
  }
);

// Adapter para evitar a criação de funções anônimas no render
const ServiceDialogAdapter = (props: GenericFormDialogProps<ServiceFormValues>) => (
  <ServiceFormDialog {...props} service={null} />
);

export default function ServicesAddPage() {
  const t = useTranslations('services');

  const handleSubmit = (values: ServiceFormValues) =>
    serviceService.create(values).then(() => {}).catch((err) => {
      const message = extractServiceErrorMessage(err);
      const error: any = new Error(message);
      if (typeof err === 'object' && err !== null && 'fieldErrors' in err) {
        error.fieldErrors = (err as any).fieldErrors;
      }
      throw error;
    });

  return (
    <AddEntityPage
      breadcrumbs={[
        { label: t('managementTitle'), href: ROUTES.services.manage },
        { label: t('newService'), active: true, icon: <MiscellaneousServicesIcon fontSize="small" /> },
      ]}
      title={t('newService')}
      subtitle={t('messages.addSubtitle')}
      successMessage={t('messages.created')}
      redirectRoute={ROUTES.services.manage}
      onSubmit={handleSubmit}
      FormDialog={ServiceDialogAdapter}
    />
  );
}
