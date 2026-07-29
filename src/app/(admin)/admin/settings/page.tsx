import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { getDb } from '@/infrastructure/db/client';
import { seoSettings } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { SettingsForm } from '@/presentation/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const { repositories } = createContainer();
  const site = await repositories.site.get(actor.tenantId);
  const [logoLight, logoDark, seoRow] = await Promise.all([
    site?.logoLightMediaId
      ? repositories.media.findById(actor.tenantId, site.logoLightMediaId)
      : null,
    site?.logoDarkMediaId
      ? repositories.media.findById(actor.tenantId, site.logoDarkMediaId)
      : null,
    getDb()
      .select()
      .from(seoSettings)
      .where(eq(seoSettings.tenantId, actor.tenantId))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <SettingsForm
        current={{
          studioName: site?.studioName ?? 'Maapkathi',
          tagline: site?.tagline ?? '',
          contactEmail: site?.contactEmail ?? '',
          contactPhone: site?.contactPhone ?? '',
          address: site?.address ?? '',
          editorVerificationRequired: site?.editorVerificationRequired ?? true,
          logoLightMediaId: site?.logoLightMediaId ?? '',
          logoLightUrl: logoLight?.url ?? '',
          logoDarkMediaId: site?.logoDarkMediaId ?? '',
          logoDarkUrl: logoDark?.url ?? '',
          blogEnabled: site?.blogEnabled ?? false,
          visionMissionEnabled: site?.visionMissionEnabled ?? false,
          visionText: site?.visionText ?? '',
          missionText: site?.missionText ?? '',
          logoShowTitle: site?.logoShowTitle ?? true,
          showAdminShield: site?.showAdminShield ?? true,
          whatsapp: site?.whatsapp ?? '',
          socials: (site?.socials as Record<string, string> | undefined) ?? {},
          seoTitle: seoRow?.defaultTitle ?? '',
          seoDescription: seoRow?.defaultDescription ?? '',
          gaId: seoRow?.gaId ?? '',
        }}
      />
    </section>
  );
}
