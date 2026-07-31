import type { Metadata } from 'next';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getPublishedMembers, getSiteSettings } from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';
import { copyText } from '@/presentation/lib/copy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Team',
  description: 'The people behind the studio.',
  alternates: { canonical: '/team' },
};

export default async function TeamPage() {
  const tenantId = await resolveActiveTenantId();
  const [members, site] = tenantId
    ? await Promise.all([getPublishedMembers(tenantId), getSiteSettings(tenantId)])
    : [[], null];

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">
          {copyText(site?.copy, 'team.eyebrow')}
        </p>
        <h1
          className="text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {copyText(site?.copy, 'team.title')}
        </h1>
      </header>

      {members.length === 0 ? (
        <p className="opacity-70">No team members yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <Reveal key={m.id} as="article" delayIndex={i % 3}>
              <div className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-current/5">
                  {m.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale group-hover:grayscale-0"
                      style={{ transition: 'filter var(--motion-duration) var(--motion-ease)' }}
                    />
                  )}
                </div>
                <h2 className="mt-4 text-lg font-medium">{m.name}</h2>
                {m.roleTitle && <p className="text-sm opacity-60">[{m.roleTitle}]</p>}
                {m.bio && <p className="mt-2 text-sm opacity-70">{m.bio}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
