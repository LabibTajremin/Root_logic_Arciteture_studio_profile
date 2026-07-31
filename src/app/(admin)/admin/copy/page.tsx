import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { CopyEditor } from '@/presentation/components/admin/CopyEditor';

export const dynamic = 'force-dynamic';

export default async function CopyPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const { repositories } = createContainer();
  const site = await repositories.site.get(actor.tenantId);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Site Text</h1>
        <p className="mt-1 text-sm opacity-70">
          Every heading, eyebrow, and call-to-action on the public site, grouped by where it
          appears. Leave a field blank to use the default shown as its placeholder.
        </p>
      </div>
      <CopyEditor overrides={(site?.copy as Record<string, string> | undefined) ?? {}} />
    </section>
  );
}
