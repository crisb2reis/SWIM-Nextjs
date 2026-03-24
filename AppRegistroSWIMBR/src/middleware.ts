import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['pt', 'en', 'es'],

  // Used when no locale matches
  defaultLocale: 'pt',
  
  // Opção para não usar prefixo no idioma padrão (se desejar)
  localePrefix: 'as-needed' 
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(pt|en|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
