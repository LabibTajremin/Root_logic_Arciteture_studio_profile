'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { themeSettings } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';

export interface AppearanceState {
  saved?: boolean;
  error?: string;
}

export async function updateAppearanceAction(
  _prev: AppearanceState,
  formData: FormData,
): Promise<AppearanceState> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) {
    return { error: 'Only admins can change appearance.' };
  }

  const values = {
    tenantId: actor.tenantId,
    mode: String(formData.get('mode') ?? 'system'),
    accentId: String(formData.get('accentId') ?? 'oxblood'),
    patternId: String(formData.get('patternId') ?? 'none'),
    patternOpacity: Number(formData.get('patternOpacity') ?? 6),
    motionPreset: String(formData.get('motionPreset') ?? 'refined'),
    fontPairId: String(formData.get('fontPairId') ?? 'fraunces-manrope'),
    updatedAt: new Date(),
  };

  await getDb()
    .insert(themeSettings)
    .values(values)
    .onConflictDoUpdate({ target: themeSettings.tenantId, set: values });

  // Theme is injected in the root layout, so every page must revalidate.
  revalidatePath('/', 'layout');
  return { saved: true };
}
