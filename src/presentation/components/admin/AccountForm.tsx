'use client';

import { useActionState } from 'react';
import { changePasswordAction, type AccountState } from '@/app/(admin)/admin/account/actions';

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function AccountForm() {
  const [state, action, pending] = useActionState<AccountState, FormData>(changePasswordAction, {});

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        Current password
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        New password
        <input
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Confirm new password
        <input
          type="password"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className={field}
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p className="text-sm text-green-700 dark:text-green-400">Password updated.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
