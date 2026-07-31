import type { Metadata } from 'next';
import Link from 'next/link';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import {
  getAwards,
  getPublishedMembers,
  getSiteSettings,
  getStats,
  getValues,
} from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';
import { copyText } from '@/presentation/lib/copy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About',
  description: 'Who we are, what we believe, and how we work.',
};

export default async function AboutPage() {
  const tenantId = await resolveActiveTenantId();
  const [site, stats, values, awards, members] = tenantId
    ? await Promise.all([
        getSiteSettings(tenantId),
        getStats(tenantId),
        getValues(tenantId),
        getAwards(tenantId),
        getPublishedMembers(tenantId),
      ])
    : [null, [], [], [], []];

  return (
    <main className="mx-auto max-w-5xl px-4 py-20 md:px-6 md:py-28">
      <header className="mb-16 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">
          {copyText(site?.copy, 'about.eyebrow')}
        </p>
        <h1
          className="mt-2 text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {site?.studioName ?? 'Maapkathi'}
        </h1>
        {site?.tagline && <p className="mt-4 text-lg opacity-70">{site.tagline}</p>}
      </header>

      {site?.visionMissionEnabled && (site.visionText || site.missionText) && (
        <section className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {site.visionText && (
            <Reveal className="rounded-[var(--radius)] border border-current/10 p-8">
              <h2 className="text-sm uppercase tracking-[0.2em] opacity-60">Our vision</h2>
              <p className="mt-3 text-lg leading-relaxed">{site.visionText}</p>
            </Reveal>
          )}
          {site.missionText && (
            <Reveal className="rounded-[var(--radius)] border border-current/10 p-8">
              <h2 className="text-sm uppercase tracking-[0.2em] opacity-60">Our mission</h2>
              <p className="mt-3 text-lg leading-relaxed">{site.missionText}</p>
            </Reveal>
          )}
        </section>
      )}

      {stats.length > 0 && (
        <section className="mb-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id} className="text-center">
              <p className="text-4xl font-semibold" style={{ fontFamily: 'var(--font-headings)' }}>
                {s.value}
                {s.suffix}
              </p>
              <p className="mt-1 text-sm opacity-60">{s.label}</p>
            </div>
          ))}
        </section>
      )}

      {values.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-medium tracking-tight">Our values</h2>
          <ol className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.id} as="li" delayIndex={i % 2}>
                <div className="flex gap-4">
                  <span className="text-sm opacity-40">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-lg font-medium">{v.title}</h3>
                    {v.body && <p className="mt-1 opacity-70">{v.body}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {awards.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-medium tracking-tight">Recognition</h2>
          <ul className="flex flex-col divide-y divide-current/10">
            {awards.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-4 py-3">
                <span>{a.title}</span>
                {a.year && <span className="shrink-0 text-sm opacity-50">{a.year}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {members.length > 0 && (
        <section>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-medium tracking-tight">The team</h2>
            <Link href="/team" className="text-sm underline underline-offset-4">
              Meet everyone
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {members.slice(0, 4).map((m) => (
              <div key={m.id}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-current/5">
                  {m.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">{m.name}</p>
                {m.roleTitle && <p className="text-xs opacity-60">{m.roleTitle}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
