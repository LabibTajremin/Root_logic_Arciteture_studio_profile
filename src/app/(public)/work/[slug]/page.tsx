import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getProjectBySlug, getProjectGallery } from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tenantId = await resolveActiveTenantId();
  const project = tenantId ? await getProjectBySlug(tenantId, slug) : null;
  if (!project) return { title: 'Project not found' };
  return {
    title: project.title,
    description: project.summary ?? undefined,
    openGraph: {
      title: project.title,
      description: project.summary ?? undefined,
      images: project.coverUrl ? [{ url: project.coverUrl }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const tenantId = await resolveActiveTenantId();
  const project = tenantId ? await getProjectBySlug(tenantId, slug) : null;
  if (!project) notFound();

  const gallery = await getProjectGallery(tenantId!, project.id);
  const year = project.completedAt ? project.completedAt.getFullYear() : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary ?? undefined,
    image: project.coverUrl ?? undefined,
    locationCreated: project.location ?? undefined,
    dateCreated: year ?? undefined,
  };

  const specs = [
    ['Client', project.clientName],
    ['Location', project.location],
    ['Area', project.areaSqft ? `${project.areaSqft} sqft` : null],
    ['Year', year?.toString() ?? null],
    ['Category', project.categoryName],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative flex h-[70svh] min-h-[420px] items-end overflow-hidden">
        {project.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverUrl}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 text-white md:px-6">
          {project.categoryName && (
            <p className="mb-2 text-xs uppercase tracking-[0.2em] opacity-80">
              {project.categoryName}
            </p>
          )}
          <h1
            className="max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight"
            style={{ fontFamily: 'var(--font-headings)' }}
          >
            {project.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1fr_280px] md:px-6 md:py-24">
        <div className="max-w-[68ch]">
          {project.summary && (
            <p className="text-xl leading-relaxed opacity-90">{project.summary}</p>
          )}
          {project.body && <p className="mt-6 leading-relaxed opacity-80">{project.body}</p>}
        </div>
        {specs.length > 0 && (
          <aside className="h-fit md:sticky md:top-24">
            <dl className="flex flex-col divide-y divide-current/10 rounded-[var(--radius)] border border-current/10">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="opacity-60">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>

      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {gallery
              .filter((m) => m.type === 'image')
              .map((m) => (
                <Reveal key={m.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt={m.altText ?? project.title}
                    loading="lazy"
                    className="w-full rounded-[var(--radius)]"
                  />
                </Reveal>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
