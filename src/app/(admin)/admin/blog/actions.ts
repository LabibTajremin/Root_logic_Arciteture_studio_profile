'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { posts } from '@/infrastructure/db/schema';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { RolePolicy } from '@/domain/services/RolePolicy';

export interface PostFormState {
  error?: string;
  postId?: string;
}

async function requireAdmin() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) return null;
  if (isReadOnly()) return null;
  return actor;
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `post-${Date.now()}`
  );
}

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const actor = await requireAdmin();
  if (!actor) return { error: 'Not permitted.' };

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { error: 'Title is required.' };

  let slug = slugify(title);
  const db = getDb();
  const existing = await db.query.posts.findFirst({
    where: and(eq(posts.tenantId, actor.tenantId), eq(posts.slug, slug)),
  });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const [row] = await db
    .insert(posts)
    .values({
      tenantId: actor.tenantId,
      slug,
      title,
      excerpt: (formData.get('excerpt') as string) || null,
      coverMediaId: (formData.get('coverMediaId') as string) || null,
      status: 'draft',
    })
    .returning();

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  return { postId: row!.id };
}

export async function updatePostAction(
  id: string,
  patch: {
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    tags: string[];
    status: string;
  },
): Promise<{ error?: string }> {
  const actor = await requireAdmin();
  if (!actor) return { error: 'Not permitted.' };

  const db = getDb();
  const slug = patch.slug.trim();
  if (!slug) return { error: 'Slug is required.' };

  // Guard the (tenant, slug) unique constraint so renaming to an existing slug
  // returns a friendly message instead of crashing.
  const clash = await db.query.posts.findFirst({
    where: and(eq(posts.tenantId, actor.tenantId), eq(posts.slug, slug)),
  });
  if (clash && clash.id !== id) {
    return { error: `Another post already uses the slug "${slug}".` };
  }

  // Preserve the original publish date; only stamp it the first time a post goes live.
  const current = await db.query.posts.findFirst({
    where: and(eq(posts.tenantId, actor.tenantId), eq(posts.id, id)),
  });
  const publishedAt = patch.status === 'published' ? (current?.publishedAt ?? new Date()) : null;

  await db
    .update(posts)
    .set({
      title: patch.title,
      slug,
      excerpt: patch.excerpt || null,
      body: patch.body || null,
      tags: patch.tags,
      status: patch.status,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(and(eq(posts.tenantId, actor.tenantId), eq(posts.id, id)));

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  return {};
}

export async function deletePostAction(id: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .delete(posts)
    .where(and(eq(posts.tenantId, actor.tenantId), eq(posts.id, id)));
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

export async function setPostCoverAction(id: string, mediaId: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(posts)
    .set({ coverMediaId: mediaId, updatedAt: new Date() })
    .where(and(eq(posts.tenantId, actor.tenantId), eq(posts.id, id)));
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}
