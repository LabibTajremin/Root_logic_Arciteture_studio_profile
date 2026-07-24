'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { services } from '@/infrastructure/db/schema';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { RolePolicy } from '@/domain/services/RolePolicy';

export interface ServiceFormState {
  error?: string;
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
      .replace(/^-+|-+$/g, '') || `service-${Date.now()}`
  );
}

export async function createServiceAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const actor = await requireAdmin();
  if (!actor) return { error: 'Not permitted.' };

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { error: 'Title is required.' };
  const parentId = (formData.get('parentId') as string) || null;

  let slug = slugify(title);
  const db = getDb();
  const existing = await db.query.services.findFirst({
    where: and(eq(services.tenantId, actor.tenantId), eq(services.slug, slug)),
  });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  await db.insert(services).values({
    tenantId: actor.tenantId,
    title,
    slug,
    excerpt: (formData.get('excerpt') as string) || null,
    iconMediaId: (formData.get('iconMediaId') as string) || null,
    parentId,
    sortOrder: Date.now(),
    status: 'published',
  });

  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
  return {};
}

export async function updateServiceAction(
  id: string,
  patch: { title: string; excerpt: string },
): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(services)
    .set({ title: patch.title, excerpt: patch.excerpt || null, updatedAt: new Date() })
    .where(and(eq(services.tenantId, actor.tenantId), eq(services.id, id)));
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}

export async function setServiceIconAction(id: string, mediaId: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(services)
    .set({ iconMediaId: mediaId, updatedAt: new Date() })
    .where(and(eq(services.tenantId, actor.tenantId), eq(services.id, id)));
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}

export async function toggleServicePublishedAction(id: string, published: boolean): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(services)
    .set({ status: published ? 'published' : 'draft', updatedAt: new Date() })
    .where(and(eq(services.tenantId, actor.tenantId), eq(services.id, id)));
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}

export async function deleteServiceAction(id: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .delete(services)
    .where(and(eq(services.tenantId, actor.tenantId), eq(services.id, id)));
  revalidatePath('/admin/services');
  revalidatePath('/services');
  revalidatePath('/');
}
