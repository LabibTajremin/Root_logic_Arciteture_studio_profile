import { notFound, redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { posts, mediaAssets } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { BlogEditor } from '@/presentation/components/admin/BlogEditor';

export const dynamic = 'force-dynamic';

export default async function BlogPostAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const [row] = await getDb()
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      body: posts.body,
      tags: posts.tags,
      status: posts.status,
      coverMediaId: posts.coverMediaId,
      coverUrl: mediaAssets.url,
    })
    .from(posts)
    .leftJoin(mediaAssets, eq(mediaAssets.id, posts.coverMediaId))
    .where(and(eq(posts.tenantId, actor.tenantId), eq(posts.id, id)))
    .limit(1);

  if (!row) notFound();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <BlogEditor post={row} />
    </section>
  );
}
