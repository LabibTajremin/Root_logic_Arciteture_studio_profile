'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { DEFAULT_SITE_SETTINGS } from '@/presentation/lib/defaults';
import { COPY_FIELDS } from '@/presentation/lib/copy';

export interface CopyState {
  saved?: boolean;
  error?: string;
}

export async function updateCopyAction(_prev: CopyState, formData: FormData): Promise<CopyState> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) {
    return { error: 'Only admins can change site text.' };
  }
  if (isReadOnly()) return { error: 'This deployment is read-only (licence).' };

  const { repositories } = createContainer();
  const existing = await repositories.site.get(actor.tenantId);
  const base = existing ?? { ...DEFAULT_SITE_SETTINGS, tenantId: actor.tenantId };

  // Only store overrides that actually differ from the built-in default — an empty or
  // unchanged field just means "use the default", keeping the JSONB blob small and the
  // defaults easy to update in code later without leaving stale copies behind.
  const copy: Record<string, string> = {};
  for (const field of COPY_FIELDS) {
    const value = (formData.get(field.key) as string)?.trim();
    if (value && value !== field.default) copy[field.key] = value;
  }

  await repositories.site.upsert({ ...base, tenantId: actor.tenantId, copy });

  revalidatePath('/', 'layout');
  revalidatePath('/work');
  revalidatePath('/team');
  revalidatePath('/contact');
  revalidatePath('/about');
  revalidatePath('/services');
  revalidatePath('/blog');
  revalidatePath('/admin/copy');
  return { saved: true };
}
