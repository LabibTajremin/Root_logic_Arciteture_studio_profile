'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getActor } from '@/infrastructure/auth/actor';
import { createContainer } from '@/infrastructure/container';
import { hashPassword, verifyPassword } from '@/infrastructure/auth/password';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';

export interface AccountState {
  saved?: boolean;
  error?: string;
}

export async function changePasswordAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (isReadOnly()) return { error: 'This deployment is read-only (licence).' };

  const current = String(formData.get('currentPassword') ?? '');
  const next = String(formData.get('newPassword') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (next.length < 8) return { error: 'New password must be at least 8 characters.' };
  if (next !== confirm) return { error: 'New passwords do not match.' };

  const { repositories } = createContainer();
  const user = await repositories.users.findById(actor.tenantId, actor.userId);
  if (!user) return { error: 'Account not found.' };

  const ok = await verifyPassword(user.passwordHash, current);
  if (!ok) return { error: 'Current password is incorrect.' };

  const passwordHash = await hashPassword(next);
  await repositories.users.update(actor.tenantId, actor.userId, {
    passwordHash,
    mustChangePassword: false,
  });

  revalidatePath('/admin', 'layout');
  return { saved: true };
}
