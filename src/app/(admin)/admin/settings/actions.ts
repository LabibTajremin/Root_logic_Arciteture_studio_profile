'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { DEFAULT_SITE_SETTINGS } from '@/presentation/lib/defaults';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { RolePolicy } from '@/domain/services/RolePolicy';

export interface SettingsState {
  saved?: boolean;
  error?: string;
}

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) {
    return { error: 'Only admins can change settings.' };
  }
  if (isReadOnly()) return { error: 'This deployment is read-only (licence).' };

  const { repositories } = createContainer();
  const existing = await repositories.site.get(actor.tenantId);
  const base = existing ?? { ...DEFAULT_SITE_SETTINGS, tenantId: actor.tenantId };

  await repositories.site.upsert({
    ...base,
    tenantId: actor.tenantId,
    studioName: String(formData.get('studioName') ?? base.studioName),
    tagline: (formData.get('tagline') as string) || null,
    contactEmail: (formData.get('contactEmail') as string) || null,
    contactPhone: (formData.get('contactPhone') as string) || null,
    address: (formData.get('address') as string) || null,
    editorVerificationRequired: formData.get('editorVerificationRequired') === 'on',
    logoLightMediaId: (formData.get('logoLightMediaId') as string) || null,
    logoDarkMediaId: (formData.get('logoDarkMediaId') as string) || null,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
  return { saved: true };
}
