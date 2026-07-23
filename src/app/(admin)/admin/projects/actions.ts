'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { createContainer } from '@/infrastructure/container';
import { getActor } from '@/infrastructure/auth/actor';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { getDb } from '@/infrastructure/db/client';
import { mediaAssets, projects } from '@/infrastructure/db/schema';

export interface ProjectFormState {
  error?: string;
}

function slugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (isReadOnly()) return { error: 'This deployment is read-only (licence).' };

  const title = String(formData.get('title') ?? '').trim();
  const slug = slugify(String(formData.get('slug') || title));
  const { useCases } = createContainer();
  const result = await useCases.createProject.execute(actor, {
    title,
    slug,
    summary: (formData.get('summary') as string) || null,
    location: (formData.get('location') as string) || null,
  });

  if (!result.ok) return { error: result.error.message };
  revalidatePath('/admin/projects');
  redirect(`/admin/projects/${result.value.id}`);
}

export async function updateProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (isReadOnly()) return { error: 'This deployment is read-only (licence).' };
  const id = String(formData.get('id'));
  const { useCases } = createContainer();
  const result = await useCases.updateProject.execute(actor, {
    id,
    title: String(formData.get('title') ?? '').trim(),
    summary: (formData.get('summary') as string) || null,
    body: (formData.get('body') as string) || null,
    location: (formData.get('location') as string) || null,
    isFeatured: formData.get('isFeatured') === 'on',
  });
  if (!result.ok) return { error: result.error.message };
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath('/');
  return {};
}

export async function publishProjectAction(id: string): Promise<{ error?: string }> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (isReadOnly()) return { error: 'This deployment is read-only (licence).' };
  const { useCases } = createContainer();
  const result = await useCases.publishProject.execute(actor, id);
  if (!result.ok) return { error: result.error.message };
  revalidatePath('/');
  revalidatePath('/work');
  revalidatePath(`/admin/projects/${id}`);
  return {};
}

/** Set a media asset as the project cover (admin/editor). */
export async function setCoverAction(projectId: string, mediaId: string): Promise<void> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (isReadOnly()) return;
  await getDb()
    .update(projects)
    .set({ coverMediaId: mediaId, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.tenantId, actor.tenantId)));
  // Ensure the media row belongs to this tenant/project before it becomes a cover.
  await getDb()
    .update(mediaAssets)
    .set({ projectId, updatedAt: new Date() })
    .where(and(eq(mediaAssets.id, mediaId), eq(mediaAssets.tenantId, actor.tenantId)));
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/');
}
