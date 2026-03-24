import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Define logic for matching locale
  if (!locale || !['pt', 'en', 'es'].includes(locale)) {
    locale = 'pt';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
