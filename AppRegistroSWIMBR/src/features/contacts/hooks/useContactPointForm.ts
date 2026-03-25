import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import type { ContactPoint } from '../types/contact.types';

export const useContactPointFormSchema = () => {
  const t = useTranslations('contacts.validation');

  return z.object({
    name: z.string().min(1, t('nameRequired')).max(255),
    email: z.string().min(1, t('emailRequired')).email(t('emailInvalid')),
    role: z.string().max(100).optional(),
    phone: z.string().max(30).optional(),
    organization_id: z.number().min(1, t('organizationRequired')),
  });
};

export type ContactPointFormValues = z.infer<ReturnType<typeof useContactPointFormSchema>>;

export const useContactPointForm = (defaultValues?: ContactPoint) => {
  const schema = useContactPointFormSchema();

  return useForm<ContactPointFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      role: defaultValues?.role ?? '',
      phone: defaultValues?.phone ?? '',
      organization_id: defaultValues?.organization_id ?? 0,
    },
  });
};
