import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { AccountForm } from '@/presentation/components/admin/AccountForm';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 opacity-60">Change your password.</p>
      </div>
      <AccountForm />
    </section>
  );
}
