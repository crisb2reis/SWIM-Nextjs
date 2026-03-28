import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { LogsContainer } from '@/features/logs/LogsContainer';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'logs.metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function AdminLogsPage() {
  return <LogsContainer />;
}
