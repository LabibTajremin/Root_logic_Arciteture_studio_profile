import { notFound, redirect } from 'next/navigation';
import { and, asc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { mediaAssets, services } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { ServiceEditor } from '@/presentation/components/admin/ServiceEditor';

export const dynamic = 'force-dynamic';

export default async function ServiceEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const db = getDb();
  const [service] = await db
    .select({
      id: services.id,
      title: services.title,
      slug: services.slug,
      excerpt: services.excerpt,
      body: services.body,
      parentId: services.parentId,
    })
    .from(services)
    .where(and(eq(services.tenantId, actor.tenantId), eq(services.id, id)))
    .limit(1);

  if (!service) notFound();

  const gallery = await db
    .select({ id: mediaAssets.id, url: mediaAssets.url })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.tenantId, actor.tenantId), eq(mediaAssets.serviceId, id)))
    .orderBy(asc(mediaAssets.sortOrder));

  let parentTitle: string | null = null;
  if (service.parentId) {
    const [parent] = await db
      .select({ title: services.title })
      .from(services)
      .where(and(eq(services.tenantId, actor.tenantId), eq(services.id, service.parentId)))
      .limit(1);
    parentTitle = parent?.title ?? null;
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit service</h1>
        <p className="mt-1 opacity-60">
          {parentTitle ? `Sub-service of ${parentTitle}` : 'Top-level category'} · public page at{' '}
          <span className="font-mono">/services/{service.slug}</span>
        </p>
      </div>
      <ServiceEditor service={service} gallery={gallery} />
    </section>
  );
}
