import Link from 'next/link';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { projects } from '@/infrastructure/db/schema';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-600/15 text-green-700 dark:text-green-400',
  pending_review: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  draft: 'bg-current/10 opacity-70',
  archived: 'bg-current/10 opacity-50',
};

export default async function AdminProjectsPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');

  const rows = await getDb()
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      status: projects.status,
      isFeatured: projects.isFeatured,
    })
    .from(projects)
    .where(eq(projects.tenantId, actor.tenantId))
    .orderBy(desc(projects.createdAt));

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="min-h-11 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)]"
        >
          New project
        </Link>
      </div>

      <ul className="flex flex-col divide-y divide-current/10 rounded-md border border-current/10">
        {rows.length === 0 && <li className="p-4 opacity-60">No projects yet.</li>}
        {rows.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 p-4">
            <Link href={`/admin/projects/${p.id}`} className="min-w-0 flex-1">
              <span className="font-medium">{p.title}</span>
              <span className="ml-2 text-sm opacity-50">/{p.slug}</span>
            </Link>
            <div className="flex items-center gap-2">
              {p.isFeatured && <span className="text-xs opacity-60">★ featured</span>}
              <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLES[p.status] ?? ''}`}>
                {p.status.replace('_', ' ')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
