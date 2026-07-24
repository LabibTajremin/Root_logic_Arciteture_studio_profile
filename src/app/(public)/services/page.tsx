import type { Metadata } from 'next';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getServices, groupServicesByCategory } from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services',
  description: 'What we do, by category.',
};

export default async function ServicesPage() {
  const tenantId = await resolveActiveTenantId();
  const flat = tenantId ? await getServices(tenantId) : [];
  const categories = groupServicesByCategory(flat);

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">What we do</p>
        <h1
          className="text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          Services
        </h1>
      </header>

      {categories.length === 0 ? (
        <p className="opacity-70">No services published yet.</p>
      ) : (
        <div className="flex flex-col gap-16">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} as="section" delayIndex={i % 3}>
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
                    <li key={child.id} className="rounded-md border border-current/10 p-4">
                      <h3 className="font-medium">{child.title}</h3>
                      {child.excerpt && <p className="mt-1 text-sm opacity-70">{child.excerpt}</p>}
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
