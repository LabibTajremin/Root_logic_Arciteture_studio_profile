import type { Metadata } from 'next';
import { getConfig } from '@config/app.config';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getSeoSettings, getSiteSettings } from '@/infrastructure/db/queries/publicQueries';
import { SiteHeader, type NavItem } from '@/presentation/components/public/SiteHeader';
import { SiteFooter } from '@/presentation/components/public/SiteFooter';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Work', href: '/work' },
  { label: 'Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
];

function appUrl(): string {
  try {
    return getConfig().appUrl;
  } catch {
    return 'http://localhost:3000';
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await resolveActiveTenantId();
  const [site, seo] = tenantId
    ? await Promise.all([getSiteSettings(tenantId), getSeoSettings(tenantId)])
    : [null, null];

  const studioName = site?.studioName ?? 'Maapkathi';
  const description =
    seo?.defaultDescription ??
    site?.tagline ??
    'White-label portfolio & showcase platform for interior and architectural design studios.';
  const base = appUrl();

  return {
    metadataBase: new URL(base),
    title: { default: seo?.defaultTitle ?? studioName, template: `%s · ${studioName}` },
    description,
    robots: seo?.robots ?? 'index, follow',
    openGraph: {
      type: 'website',
      siteName: studioName,
      title: seo?.defaultTitle ?? studioName,
      description,
      url: base,
      images: seo?.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: seo?.ogImageUrl ? 'summary_large_image' : 'summary',
      title: seo?.defaultTitle ?? studioName,
      description,
      images: seo?.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tenantId = await resolveActiveTenantId();
  const site = tenantId ? await getSiteSettings(tenantId) : null;
  const nav = (site?.navConfig as NavItem[] | null) ?? DEFAULT_NAV;

  return (
    <div className="pattern-layer relative flex min-h-svh flex-col">
      <SiteHeader
        studioName={site?.studioName ?? 'Maapkathi'}
        nav={nav}
        phone={site?.contactPhone ?? null}
      />
      <div className="relative z-10 flex-1">{children}</div>
      <SiteFooter
        studioName={site?.studioName ?? 'Maapkathi'}
        tagline={site?.tagline ?? null}
        nav={nav}
        contactEmail={site?.contactEmail ?? null}
        contactPhone={site?.contactPhone ?? null}
        whatsapp={site?.whatsapp ?? null}
        address={site?.address ?? null}
        socials={site?.socials ?? {}}
      />
    </div>
  );
}
