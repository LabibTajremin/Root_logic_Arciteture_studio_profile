'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { heroSlides } from '@/infrastructure/db/schema';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { RolePolicy } from '@/domain/services/RolePolicy';

export interface HeroFormState {
  error?: string;
}

async function requireAdmin() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) return null;
  if (isReadOnly()) return null;
  return actor;
}

export async function createHeroSlideAction(
  _prev: HeroFormState,
  formData: FormData,
): Promise<HeroFormState> {
  const actor = await requireAdmin();
  if (!actor) return { error: 'Not permitted.' };

  const headline = String(formData.get('headline') ?? '').trim();
  if (!headline) return { error: 'Headline is required.' };

  await getDb()
    .insert(heroSlides)
    .values({
      tenantId: actor.tenantId,
      headline,
      eyebrow: (formData.get('eyebrow') as string) || null,
      kickerWord: (formData.get('kickerWord') as string) || null,
      body: (formData.get('body') as string) || null,
      ctaLabel: (formData.get('ctaLabel') as string) || null,
      ctaHref: (formData.get('ctaHref') as string) || null,
      imageMediaId: (formData.get('imageMediaId') as string) || null,
      sortOrder: Date.now(),
      isActive: true,
    });

  revalidatePath('/admin/hero');
  revalidatePath('/');
  return {};
}

export async function toggleHeroActiveAction(id: string, isActive: boolean): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(heroSlides)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(heroSlides.tenantId, actor.tenantId), eq(heroSlides.id, id)));
  revalidatePath('/admin/hero');
  revalidatePath('/');
}

export async function deleteHeroSlideAction(id: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .delete(heroSlides)
    .where(and(eq(heroSlides.tenantId, actor.tenantId), eq(heroSlides.id, id)));
  revalidatePath('/admin/hero');
  revalidatePath('/');
}

export async function setHeroImageAction(id: string, mediaId: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  await getDb()
    .update(heroSlides)
    .set({ imageMediaId: mediaId, updatedAt: new Date() })
    .where(and(eq(heroSlides.tenantId, actor.tenantId), eq(heroSlides.id, id)));
  revalidatePath('/admin/hero');
  revalidatePath('/');
}
