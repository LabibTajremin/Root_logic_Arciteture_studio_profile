'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { members } from '@/infrastructure/db/schema';
import { and, eq } from 'drizzle-orm';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { RolePolicy } from '@/domain/services/RolePolicy';

export interface MemberFormState {
  error?: string;
}

async function requireAdmin() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) return null;
  if (isReadOnly()) return null;
  return actor;
}

export async function createMemberAction(
  _prev: MemberFormState,
  formData: FormData,
): Promise<MemberFormState> {
  const actor = await requireAdmin();
  if (!actor) return { error: 'Not permitted.' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Name is required.' };

  await getDb()
    .insert(members)
    .values({
      tenantId: actor.tenantId,
      name,
      roleTitle: (formData.get('roleTitle') as string) || null,
      bio: (formData.get('bio') as string) || null,
      sortOrder: Date.now(),
      status: 'published',
    });

  revalidatePath('/admin/members');
  revalidatePath('/team');
  revalidatePath('/');
  return {};
}

export async function updateMemberAction(
  id: string,
  patch: { name: string; roleTitle: string; bio: string },
): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(members)
    .set({
      name: patch.name,
      roleTitle: patch.roleTitle || null,
      bio: patch.bio || null,
      updatedAt: new Date(),
    })
    .where(and(eq(members.tenantId, actor.tenantId), eq(members.id, id)));
  revalidatePath('/admin/members');
  revalidatePath('/team');
  revalidatePath('/');
}

export async function togglePublishedAction(id: string, published: boolean): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(members)
    .set({ status: published ? 'published' : 'draft', updatedAt: new Date() })
    .where(and(eq(members.tenantId, actor.tenantId), eq(members.id, id)));
  revalidatePath('/admin/members');
  revalidatePath('/team');
  revalidatePath('/');
}

export async function deleteMemberAction(id: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .delete(members)
    .where(and(eq(members.tenantId, actor.tenantId), eq(members.id, id)));
  revalidatePath('/admin/members');
  revalidatePath('/team');
  revalidatePath('/');
}

export async function setMemberPhotoAction(id: string, mediaId: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(members)
    .set({ photoMediaId: mediaId, updatedAt: new Date() })
    .where(and(eq(members.tenantId, actor.tenantId), eq(members.id, id)));
  revalidatePath('/admin/members');
  revalidatePath('/team');
  revalidatePath('/');
}
