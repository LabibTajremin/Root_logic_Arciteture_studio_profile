'use client';

import { useActionState } from 'react';
import { createProjectAction, type ProjectFormState } from '@/app/(admin)/admin/projects/actions';

const field =
  'min-h-11 rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function NewProjectForm() {
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(
    createProjectAction,
    {},
  );

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        Title
        <input name="title" required className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Slug (optional — derived from title)
        <input name="slug" placeholder="riverside-villa" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Summary
        <textarea name="summary" rows={3} className={`${field} min-h-20`} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Location
        <input name="location" className={field} />
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create project'}
      </button>
    </form>
  );
}
