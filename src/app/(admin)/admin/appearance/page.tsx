import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { getActiveTheme } from '@/presentation/theme/getActiveTheme';
import { AppearanceForm } from '@/presentation/components/admin/AppearanceForm';
import { RolePolicy } from '@/domain/services/RolePolicy';

export const dynamic = 'force-dynamic';

export default async function AppearancePage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const theme = await getActiveTheme();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appearance</h1>
        <p className="mt-1 opacity-60">
          Changes apply to the public site. All 24 accents pass AA contrast in both modes.
        </p>
      </div>
      <AppearanceForm
        current={{
          mode: theme.mode,
          accentId: theme.accentId,
          patternId: theme.patternId,
          patternOpacity: theme.patternOpacity,
          motionPreset: theme.motionPreset,
          fontPairId: theme.fontPairId,
        }}
      />
    </section>
  );
}
