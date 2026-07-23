import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getSiteSettings } from '@/infrastructure/db/queries/publicQueries';
import { SiteHeader, type NavItem } from '@/presentation/components/public/SiteHeader';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Work', href: '/work' },
  { label: 'Team', href: '/team' },
  { label: 'Contact', href: '/contact' },
];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tenantId = await resolveActiveTenantId();
  const site = tenantId ? await getSiteSettings(tenantId) : null;
  const nav = (site?.navConfig as NavItem[] | null) ?? DEFAULT_NAV;

  return (
    <div className="pattern-layer relative">
      <SiteHeader
        studioName={site?.studioName ?? 'Maapkathi Studio'}
        nav={nav}
        phone={site?.contactPhone ?? null}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
