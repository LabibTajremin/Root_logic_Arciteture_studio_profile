'use client';

import { useActionState } from 'react';
import { updateSettingsAction, type SettingsState } from '@/app/(admin)/admin/settings/actions';

const field =
  'min-h-11 rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export interface SettingsValues {
  studioName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  editorVerificationRequired: boolean;
}

export function SettingsForm({ current }: { current: SettingsValues }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateSettingsAction,
    {},
  );

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        Studio name
        <input name="studioName" defaultValue={current.studioName} required className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Tagline
        <input name="tagline" defaultValue={current.tagline} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Contact email
        <input
          name="contactEmail"
          type="email"
          defaultValue={current.contactEmail}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Contact phone
        <input name="contactPhone" defaultValue={current.contactPhone} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Address
        <input name="address" defaultValue={current.address} className={field} />
      </label>

      <label className="mt-2 flex items-start gap-3 rounded-md border border-current/15 p-4 text-sm">
        <input
          type="checkbox"
          name="editorVerificationRequired"
          defaultChecked={current.editorVerificationRequired}
          className="mt-1"
        />
        <span>
          <span className="font-medium">Require verification for editors</span>
          <span className="mt-1 block opacity-70">
            When on, an editor’s new content waits in the approvals queue until an admin approves
            it. When off, editors publish directly.
          </span>
        </span>
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.saved && <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
