import type { Metadata } from 'next';
import Script from 'next/script';
import { eq } from 'drizzle-orm';
import './globals.css';
import { ThemeScript } from '@/presentation/theme/ThemeScript';
import { ThemeStyle } from '@/presentation/theme/ThemeStyle';
import { getActiveTheme } from '@/presentation/theme/getActiveTheme';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getDb } from '@/infrastructure/db/client';
import { seoSettings } from '@/infrastructure/db/schema';

async function getSeo() {
  try {
    const tenantId = await resolveActiveTenantId();
    if (!tenantId) return null;
    const [row] = await getDb()
      .select()
      .from(seoSettings)
      .where(eq(seoSettings.tenantId, tenantId))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeo();
  const title = seo?.defaultTitle || 'Maapkathi';
  return {
    title: { default: title, template: `%s · ${title}` },
    description:
      seo?.defaultDescription ||
      'White-label portfolio & showcase platform for interior and architectural design studios.',
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, seo] = await Promise.all([getActiveTheme(), getSeo()]);
  const gaId = seo?.gaId?.trim();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <ThemeStyle theme={theme} />
      </head>
      <body>
        {children}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
