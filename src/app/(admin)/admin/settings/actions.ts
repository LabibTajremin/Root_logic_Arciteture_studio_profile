'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { getDb } from '@/infrastructure/db/client';
import { seoSettings } from '@/infrastructure/db/schema';
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

  // Collect social links, dropping empty entries.
  const socials: Record<string, string> = {};
  for (const platform of ['instagram', 'facebook', 'linkedin', 'youtube']) {
    const url = (formData.get(`social_${platform}`) as string)?.trim();
    if (url) socials[platform] = url;
  }

  await repositories.site.upsert({
    ...base,
    tenantId: actor.tenantId,
    studioName: String(formData.get('studioName') ?? base.studioName),
    tagline: (formData.get('tagline') as string) || null,
    contactEmail: (formData.get('contactEmail') as string) || null,
    contactPhone: (formData.get('contactPhone') as string) || null,
    whatsapp: (formData.get('whatsapp') as string) || null,
    address: (formData.get('address') as string) || null,
    socials,
    editorVerificationRequired: formData.get('editorVerificationRequired') === 'on',
    logoLightMediaId: (formData.get('logoLightMediaId') as string) || null,
    logoDarkMediaId: (formData.get('logoDarkMediaId') as string) || null,
    blogEnabled: formData.get('blogEnabled') === 'on',
    visionMissionEnabled: formData.get('visionMissionEnabled') === 'on',
    visionText: (formData.get('visionText') as string) || null,
    missionText: (formData.get('missionText') as string) || null,
    logoShowTitle: formData.get('logoShowTitle') === 'on',
    showAdminShield: formData.get('showAdminShield') === 'on',
  });

  // SEO settings live in their own table.
  const seoValues = {
    tenantId: actor.tenantId,
    defaultTitle: (formData.get('seoTitle') as string) || null,
    defaultDescription: (formData.get('seoDescription') as string) || null,
    gaId: (formData.get('gaId') as string) || null,
    updatedAt: new Date(),
  };
  await getDb()
    .insert(seoSettings)
    .values(seoValues)
    .onConflictDoUpdate({ target: seoSettings.tenantId, set: seoValues });

  revalidatePath('/about');
  revalidatePath('/blog');

  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
  return { saved: true };
}
