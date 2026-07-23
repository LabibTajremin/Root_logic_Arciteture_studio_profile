import { redirect } from 'next/navigation';
import { and, asc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { projects } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { ApprovalRow } from '@/presentation/components/admin/ApprovalRow';

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canApproveSubmissions(actor.role)) redirect('/admin');

  const pending = await getDb()
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      summary: projects.summary,
    })
    .from(projects)
    .where(and(eq(projects.tenantId, actor.tenantId), eq(projects.status, 'pending_review')))
    .orderBy(asc(projects.createdAt));

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pending approvals</h1>
        <p className="mt-1 opacity-60">Editor submissions awaiting review.</p>
      </div>

      {pending.length === 0 ? (
        <p className="opacity-60">Nothing awaiting review.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-current/10 rounded-md border border-current/10">
          {pending.map((p) => (
            <ApprovalRow key={p.id} project={p} />
          ))}
        </ul>
      )}
    </section>
  );
}
