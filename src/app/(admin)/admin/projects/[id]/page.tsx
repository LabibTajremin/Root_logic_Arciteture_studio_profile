import { notFound, redirect } from 'next/navigation';
import { and, asc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { mediaAssets, projects } from '@/infrastructure/db/schema';
import { ProjectEditor } from '@/presentation/components/admin/ProjectEditor';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) redirect('/login');

  const [project] = await getDb()
    .select()
    .from(projects)
    .where(and(eq(projects.tenantId, actor.tenantId), eq(projects.id, id)))
    .limit(1);
  if (!project) notFound();

  const media = await getDb()
    .select({ id: mediaAssets.id, url: mediaAssets.url, altText: mediaAssets.altText })
    .from(mediaAssets)
    .where(and(eq(mediaAssets.tenantId, actor.tenantId), eq(mediaAssets.projectId, id)))
    .orderBy(asc(mediaAssets.sortOrder));

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
      <ProjectEditor
        project={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          body: project.body,
          location: project.location,
          isFeatured: project.isFeatured,
          status: project.status,
          coverMediaId: project.coverMediaId,
        }}
        media={media}
      />
    </section>
  );
}
