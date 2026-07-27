import { redirect } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { members, mediaAssets } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { MemberManager } from '@/presentation/components/admin/MemberManager';

export const dynamic = 'force-dynamic';

export default async function MembersAdminPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const rows = await getDb()
    .select({
      id: members.id,
      name: members.name,
      roleTitle: members.roleTitle,
      bio: members.bio,
      status: members.status,
      photoUrl: mediaAssets.url,
    })
    .from(members)
    .leftJoin(mediaAssets, eq(mediaAssets.id, members.photoMediaId))
    .where(eq(members.tenantId, actor.tenantId))
    .orderBy(asc(members.sortOrder));

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team members</h1>
        <p className="mt-1 opacity-60">Manage who appears on the homepage and the /team page.</p>
      </div>
      <MemberManager members={rows} />
    </section>
  );
}
