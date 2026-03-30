import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { LogsContainer } from '@/features/logs/LogsContainer';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'logs.metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function AdminLogsPage() {
  return <LogsContainer />;
}
