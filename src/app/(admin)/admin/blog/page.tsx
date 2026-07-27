import Link from 'next/link';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { posts, mediaAssets } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { BlogList } from '@/presentation/components/admin/BlogList';

export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const rows = await getDb()
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      coverUrl: mediaAssets.url,
    })
    .from(posts)
    .leftJoin(mediaAssets, eq(mediaAssets.id, posts.coverMediaId))
    .where(eq(posts.tenantId, actor.tenantId))
    .orderBy(desc(posts.updatedAt));

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-1 opacity-60">
            Turn the blog on/off, and manage posts, from{' '}
            <Link href="/admin/settings" className="underline">
              Settings
            </Link>
            .
          </p>
        </div>
      </div>
      <BlogList posts={rows} />
    </section>
  );
}
