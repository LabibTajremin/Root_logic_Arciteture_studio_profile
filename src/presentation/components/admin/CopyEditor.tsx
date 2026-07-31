'use client';

import { useActionState } from 'react';
import { updateCopyAction, type CopyState } from '@/app/(admin)/admin/copy/actions';
import { COPY_FIELDS } from '@/presentation/lib/copy';

const field =
  'min-h-11 rounded-md border border-current/15 bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function CopyEditor({ overrides }: { overrides: Record<string, string> }) {
  const [state, action, pending] = useActionState<CopyState, FormData>(updateCopyAction, {});

  const groups = new Map<string, typeof COPY_FIELDS>();
  for (const f of COPY_FIELDS) {
    const list = groups.get(f.group) ?? [];
    list.push(f);
    groups.set(f.group, list);
  }

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      {Array.from(groups.entries()).map(([group, fields]) => (
        <fieldset
          key={group}
          className="flex flex-col gap-3 rounded-md border border-current/15 p-4"
        >
          <legend className="px-1 text-sm font-medium">{group}</legend>
          {fields.map((f) => (
            <label key={f.key} className="flex flex-col gap-1.5 text-sm">
              {f.label}
              {f.multiline ? (
                <textarea
                  name={f.key}
                  defaultValue={overrides[f.key] ?? ''}
                  placeholder={f.default}
                  rows={2}
                  className={field}
                />
              ) : (
                <input
                  name={f.key}
                  defaultValue={overrides[f.key] ?? ''}
                  placeholder={f.default}
                  className={field}
                />
              )}
            </label>
          ))}
        </fieldset>
      ))}

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
        {pending ? 'Saving…' : 'Save text'}
      </button>
    </form>
  );
}
