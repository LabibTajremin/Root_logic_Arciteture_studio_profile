import type { Metadata } from 'next';
import Link from 'next/link';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import {
  getServices,
  getSiteSettings,
  groupServicesByCategory,
} from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';
import { copyText } from '@/presentation/lib/copy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services',
  description: 'What we do, by category.',
};

export default async function ServicesPage() {
  const tenantId = await resolveActiveTenantId();
  const [flat, site] = tenantId
    ? await Promise.all([getServices(tenantId), getSiteSettings(tenantId)])
    : [[], null];
  const categories = groupServicesByCategory(flat);

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">
          {copyText(site?.copy, 'services.eyebrow')}
        </p>
        <h1
          className="text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {copyText(site?.copy, 'services.title')}
        </h1>
      </header>

      {categories.length === 0 ? (
        <p className="opacity-70">No services published yet.</p>
      ) : (
        <div className="flex flex-col gap-16">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} as="section" delayIndex={i % 3}>
              {cat.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.iconUrl}
                  alt=""
                  aria-hidden
                  className="service-icon mb-4 h-14 w-14 object-contain"
                />
              )}
              <h2
                className="text-2xl font-medium tracking-tight"
                style={{ fontFamily: 'var(--font-headings)' }}
              >
                {cat.title}
              </h2>
              {cat.excerpt && <p className="mt-2 max-w-2xl opacity-70">{cat.excerpt}</p>}
              {cat.children.length > 0 && (
                <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/services/${child.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-md border border-current/10 transition-colors hover:border-current/40"
                      >
                        {child.coverUrl ? (
                          <div className="aspect-[16/9] w-full overflow-hidden bg-current/5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={child.coverUrl}
                              alt=""
                              aria-hidden
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-1 flex-col p-4">
                          {child.iconUrl && !child.coverUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={child.iconUrl}
                              alt=""
                              aria-hidden
                              className="service-icon mb-2 h-8 w-8 object-contain"
                            />
                          )}
                          <h3 className="font-medium">{child.title}</h3>
                          {child.excerpt && (
                            <p className="mt-1 text-sm opacity-70">{child.excerpt}</p>
                          )}
                          <span className="mt-3 text-xs opacity-0 transition-opacity group-hover:opacity-60">
                            View details →
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
