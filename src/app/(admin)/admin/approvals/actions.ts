'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { getDb } from '@/infrastructure/db/client';
import { auditLog, projects } from '@/infrastructure/db/schema';
import { Authorization } from '@/application/authorization/Authorization';

export async function approveProjectAction(projectId: string): Promise<{ error?: string }> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  const guard = Authorization.ensureCanApprove(actor);
  if (!guard.ok) return { error: guard.error.message };

  const { useCases } = createContainer();
  const result = await useCases.publishProject.execute(actor, projectId);
  if (!result.ok) return { error: result.error.message };

  await getDb()
    .insert(auditLog)
    .values({
      tenantId: actor.tenantId,
      actorId: actor.userId,
      action: 'approve',
      entity: 'project',
      entityId: projectId,
      diff: { status: 'published' },
    });

  revalidatePath('/admin/approvals');
  revalidatePath('/');
  revalidatePath('/work');
  return {};
}

export async function rejectProjectAction(
  projectId: string,
  note: string,
): Promise<{ error?: string }> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  const guard = Authorization.ensureCanApprove(actor);
  if (!guard.ok) return { error: guard.error.message };

  await getDb()
    .update(projects)
    .set({ status: 'draft', updatedAt: new Date() })
    .where(and(eq(projects.tenantId, actor.tenantId), eq(projects.id, projectId)));

  await getDb()
    .insert(auditLog)
    .values({
      tenantId: actor.tenantId,
      actorId: actor.userId,
      action: 'reject',
      entity: 'project',
      entityId: projectId,
      diff: { status: 'draft', note },
    });

  revalidatePath('/admin/approvals');
  return {};
}
