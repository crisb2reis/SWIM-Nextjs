'use client';

import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { CircularProgress } from '@mui/material';

import { contactService, extractErrorMessage } from '@/features/contacts/services/contactService';
import { organizationService } from '@/features/organizations/services/organizationService';
import { AddEntityPage, type GenericFormDialogProps } from '@/components/common/AddEntityPage';
import type { ContactPointFormValues } from '@/features/contacts/hooks/useContactPointForm';
import { ROUTES } from '@/lib/routes';

// Loading fallback para o diálogo dinâmico
const ContactPointFormDialog = dynamic(
  () => import('@/features/contacts/components/ContactPointFormDialog').then((mod) => mod.ContactPointFormDialog),
  { 
    ssr: false,
    loading: () => <CircularProgress size={24} />
  }
);

// Adapter customizável para injetar organizations no diálogo
const ContactPointDialogAdapter = ({ organizations, ...props }: GenericFormDialogProps<ContactPointFormValues> & { organizations: any[] }) => (
  <ContactPointFormDialog 
    {...props} 
    contact={null} 
    organizations={organizations} 
  />
);

export default function ContactsAddPage() {
  const t = useTranslations('contacts');

  // Busca as organizações para o autocomplete
  const { data: organizations = [] } = useSWR('organizations', () => organizationService.list());

  const handleSubmit = (values: ContactPointFormValues) =>
    contactService.create(values as any).then(() => {}).catch((err) => {
      const message = extractErrorMessage(err);
      const error: any = new Error(message);
      if (typeof err === 'object' && err !== null && 'fieldErrors' in err) {
        error.fieldErrors = (err as any).fieldErrors;
      }
      throw error;
    });

  return (
    <AddEntityPage
      breadcrumbs={[
        { label: t('title'), href: ROUTES.contacts.manage },
        { label: t('newContact'), active: true, icon: <CorporateFareIcon fontSize="small" /> },
      ]}
      title={t('newContact')}
      subtitle={t('messages.addSubtitle')}
      successMessage={t('messages.created')}
      redirectRoute={ROUTES.contacts.manage}
      onSubmit={handleSubmit}
      FormDialog={(props) => <ContactPointDialogAdapter {...props} organizations={organizations} />}
    />
  );
}
