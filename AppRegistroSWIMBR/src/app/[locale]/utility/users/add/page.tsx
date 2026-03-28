'use client';

import { useTranslations } from 'next-intl';
import { AddEntityPage } from '@/components/common/AddEntityPage';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import type { UserFormValues } from '@/features/users/types/user.types';
import PeopleIcon from '@mui/icons-material/People';

export default function UsersAddPage() {
  const t = useTranslations('registration');
  const navT = useTranslations('navigation');

  const handleSubmit = async (values: UserFormValues) => {
    // Log para fins de debug, a integração real ocorre no UserFormDialog via userService
    console.log('Dados do formulário salvos com sucesso:', values);
  };

  return (
    <AddEntityPage<UserFormValues>
      title={t('title')}
      subtitle={t('subtitle')}
      successMessage={t('success')}
      redirectRoute="/utility/users/manage"
      onSubmit={handleSubmit}
      FormDialog={UserFormDialog as any}
      breadcrumbs={[
        { label: navT('usuarios'), href: '/utility/users/manage', icon: <PeopleIcon fontSize="small" /> },
        { label: navT('adicionar'), active: true },
      ]}
    />
  );
}
