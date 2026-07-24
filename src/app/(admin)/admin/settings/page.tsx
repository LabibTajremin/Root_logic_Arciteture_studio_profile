import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { SettingsForm } from '@/presentation/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const { repositories } = createContainer();
  const site = await repositories.site.get(actor.tenantId);
  const [logoLight, logoDark] = await Promise.all([
    site?.logoLightMediaId
      ? repositories.media.findById(actor.tenantId, site.logoLightMediaId)
      : null,
    site?.logoDarkMediaId
      ? repositories.media.findById(actor.tenantId, site.logoDarkMediaId)
      : null,
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
        }}
      />
    </section>
  );
}
