import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getSiteSettings } from '@/infrastructure/db/queries/publicQueries';
import { SiteHeader, type NavItem } from '@/presentation/components/public/SiteHeader';
import { SiteFooter } from '@/presentation/components/public/SiteFooter';

function buildNav(blogEnabled: boolean): NavItem[] {
  const nav: NavItem[] = [
    { label: 'Work', href: '/work' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Team', href: '/team' },
  ];
  if (blogEnabled) nav.push({ label: 'Blog', href: '/blog' });
  nav.push({ label: 'Contact', href: '/contact' });
  return nav;
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tenantId = await resolveActiveTenantId();
  const site = tenantId ? await getSiteSettings(tenantId) : null;
  const nav = (site?.navConfig as NavItem[] | null) ?? buildNav(site?.blogEnabled ?? false);

  return (
    <div className="pattern-layer relative">
      <SiteHeader
        studioName={site?.studioName ?? 'Maapkathi'}
        nav={nav}
        phone={site?.contactPhone ?? null}
        logoLightUrl={site?.logoLightUrl ?? null}
        logoDarkUrl={site?.logoDarkUrl ?? null}
        logoShowTitle={site?.logoShowTitle ?? true}
      />
      <div className="relative z-10">{children}</div>
      <SiteFooter
        studioName={site?.studioName ?? 'Maapkathi'}
        email={site?.contactEmail ?? null}
        phone={site?.contactPhone ?? null}
        whatsapp={site?.whatsapp ?? null}
        address={site?.address ?? null}
        socials={(site?.socials as Record<string, string> | undefined) ?? {}}
      />
    </div>
  );
}
