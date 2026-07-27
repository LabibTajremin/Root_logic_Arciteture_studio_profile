import { redirect } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { mediaAssets, services } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { ServiceManager } from '@/presentation/components/admin/ServiceManager';

export const dynamic = 'force-dynamic';

export default async function ServicesAdminPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const rows = await getDb()
    .select({
      id: services.id,
      title: services.title,
      excerpt: services.excerpt,
      parentId: services.parentId,
      status: services.status,
      iconUrl: mediaAssets.url,
    })
    .from(services)
    .leftJoin(mediaAssets, eq(mediaAssets.id, services.iconMediaId))
    .where(eq(services.tenantId, actor.tenantId))
    .orderBy(asc(services.sortOrder));

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
        <p className="mt-1 opacity-60">
          Organise services into categories and sub-services. Shown on the homepage and /services.
        </p>
      </div>
      <ServiceManager services={rows} />
    </section>
  );
}
