import type { Metadata } from 'next';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getPublishedProjects } from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';
import { ProjectCard } from '@/presentation/components/public/ProjectCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected interior and architectural projects.',
  alternates: { canonical: '/work' },
};

export default async function WorkPage() {
  const tenantId = await resolveActiveTenantId();
  const projects = tenantId ? await getPublishedProjects(tenantId) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">Portfolio</p>
        <h1
          className="text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          Our work
        </h1>
      </header>

      {projects.length === 0 ? (
        <p className="opacity-70">No published projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.id} as="article" delayIndex={i % 3}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
