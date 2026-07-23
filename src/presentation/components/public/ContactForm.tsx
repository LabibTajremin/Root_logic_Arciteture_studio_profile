'use client';

import { useActionState } from 'react';
import { submitContactAction, type ContactState } from '@/app/(public)/contact/actions';

const initial: ContactState = { status: 'idle' };

const field =
  'min-h-11 rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, initial);

  if (state.status === 'ok') {
    return (
      <p role="status" className="rounded-md border border-current/15 p-4">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          Name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <input name="email" type="email" required autoComplete="email" className={field} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm">
        Phone (optional)
        <input name="phone" autoComplete="tel" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Message
        <textarea name="message" required rows={5} className={`${field} min-h-32`} />
      </label>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-full bg-[var(--accent)] px-6 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
