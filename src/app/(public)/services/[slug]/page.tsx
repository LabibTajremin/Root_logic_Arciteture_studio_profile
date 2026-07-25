import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getServiceBySlug } from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tenantId = await resolveActiveTenantId();
  const service = tenantId ? await getServiceBySlug(tenantId, slug) : null;
  if (!service) return { title: 'Service' };
  return {
    title: service.title,
    description: service.excerpt ?? undefined,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenantId = await resolveActiveTenantId();
  const service = tenantId ? await getServiceBySlug(tenantId, slug) : null;
  if (!service) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-20 md:px-6 md:py-28">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm opacity-60">
        <Link href="/services" className="hover:opacity-100">
          Services
        </Link>
        {service.parentTitle && (
          <>
            <span aria-hidden>/</span>
            <span>{service.parentTitle}</span>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="opacity-100">{service.title}</span>
      </nav>

      <header className="mb-12 flex flex-col gap-4">
        {service.iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.iconUrl}
            alt=""
            aria-hidden
            className="service-icon h-16 w-16 object-contain"
          />
        )}
        <h1
          className="text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {service.title}
        </h1>
        {service.excerpt && <p className="max-w-2xl text-lg opacity-70">{service.excerpt}</p>}
      </header>

      {service.body && (
        <div className="mb-14 max-w-2xl whitespace-pre-line text-lg leading-relaxed opacity-90">
          {service.body}
        </div>
      )}

      {service.gallery.length > 0 && (
        <section className="mb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.gallery.map((img, i) => (
              <Reveal key={img.id} delayIndex={i % 3}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-current/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText ?? ''}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {service.siblings.length > 1 && (
        <section className="border-t border-current/10 pt-10">
          <h2 className="mb-6 text-sm uppercase tracking-[0.2em] opacity-60">
            More {service.parentTitle ?? 'services'}
          </h2>
          <div className="flex flex-wrap gap-3">
            {service.siblings
              .filter((s) => s.slug !== service.slug)
              .map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="rounded-full border border-current/15 px-4 py-2 text-sm hover:border-current/40"
                >
                  {s.title}
                </Link>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
