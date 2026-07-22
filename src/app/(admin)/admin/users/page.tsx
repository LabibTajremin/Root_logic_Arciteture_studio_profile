import { redirect } from 'next/navigation';
import { auth } from '@/infrastructure/auth/auth';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getDb } from '@/infrastructure/db/client';
import { DrizzleUserRepository } from '@/infrastructure/db/repositories/DrizzleUserRepository';
import { RolePolicy } from '@/domain/services/RolePolicy';

export default async function AdminUsersPage() {
  const session = await auth();
  // Defence in depth: middleware blocks editors, and the page enforces it too.
  if (!session?.user || !RolePolicy.canManageUsers(session.user.role)) {
    redirect('/admin');
  }

  const tenantId = await resolveActiveTenantId();
  const users = tenantId
    ? [
        ...(await new DrizzleUserRepository(getDb()).listByRole(tenantId, 'admin')),
        ...(await new DrizzleUserRepository(getDb()).listByRole(tenantId, 'editor')),
      ]
    : [];

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between py-3">
            <span>
              {u.name} · <span className="opacity-60">{u.email}</span>
            </span>
            <span className="text-xs uppercase tracking-wide opacity-70">{u.role}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
