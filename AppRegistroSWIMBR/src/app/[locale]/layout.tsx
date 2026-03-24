import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import MuiProvider from './MuiProvider';
import { AppWrapper } from '@/components/layout/AppWrapper';
import { notFound } from 'next/navigation';

export const metadata = {
  title: {
    template: '%s | SWIMB',
    default:  'SWIMB — Sistema de Registro',
  },
  description: 'Sistema de Registro SWIMB — CRM',
};

export function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'en' }, { locale: 'es' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!['pt', 'en', 'es'].includes(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body style={{ margin: 0, backgroundColor: '#F5F5F9' }}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <MuiProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </MuiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
